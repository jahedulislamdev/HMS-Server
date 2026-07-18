import {
    IChangePasswordPayload,
    ILoginUserPayload,
    IRegisterPatientPayload,
} from "./auth.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import jwtPayload from "./../../helper/jwtPayload";
import { envVars } from "./../../../config/env";
import { StatusCodes } from "http-status-codes";
import { authTokens } from "../../utils/token";
import AppError from "../../helper/AppError";
import { jwtUtils } from "../../utils/jwt";
import { prisma } from "../../lib/prisma";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "../../lib/auth";

//* Register Patient (user will automatically login after register)
const registerUser = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;
    //* create user via better auth build in function
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
    });
    if (!data.user) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Failed to register patient",
        );
    }

    //* create patient profile by using transection after signup comteated
    try {
        const patient = await prisma.$transaction(async (tx) => {
            return await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                },
            });
        });

        const accessToken = authTokens.getAccessToken({
            payload: jwtPayload({ data }),
        });
        const refreshToken = authTokens.getRefreshToken({
            payload: jwtPayload({ data }),
        });
        return {
            ...data,
            token: data.token,
            patient,
            accessToken,
            refreshToken,
        };
    } catch (err) {
        console.log("transection error :", err);
        //! delete user if patient transection failed
        await prisma.user.delete({ where: { id: data.user.id } });
        throw err;
    }
};

//* Login Patient
const loginUser = async (payload: ILoginUserPayload) => {
    const data = await auth.api.signInEmail({
        body: {
            email: payload.email,
            password: payload.password,
            rememberMe: payload.rememberMe,
        },
    });
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(StatusCodes.FORBIDDEN, "user is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(StatusCodes.NOT_FOUND, "user is deleted");
    }
    const accessToken = authTokens.getAccessToken({
        payload: jwtPayload({ data }),
    });
    const refreshToken = authTokens.getRefreshToken({
        payload: jwtPayload({ data }),
    });

    return { ...data, accessToken, refreshToken };
};

//* get new token using refresh token
const getNewToken = async ({
    refreshToken,
    sessionToken,
}: {
    refreshToken: string;
    sessionToken: string;
}) => {
    // check session token
    const isSessionTokenExist = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
    });

    if (!isSessionTokenExist) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid session token");
    }

    // verify refresh token
    const verifiedRefreshToken = jwtUtils.verifyToken({
        secret: envVars.REFRESH_TOKEN_SECRET,
        token: refreshToken,
    });
    if (!verifiedRefreshToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refress token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;
    // console.log({ data });

    const newAccessToken = authTokens.getAccessToken({
        payload: jwtPayload({ data }),
    });
    const newRefreshToken = authTokens.getRefreshToken({
        payload: jwtPayload({ data }),
    });
    const { token } = await prisma.session.update({
        where: { token: sessionToken },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    };
};

//* change password
const changePassword = async ({
    payload,
    sessionToken,
}: {
    payload: IChangePasswordPayload;
    sessionToken: string;
}) => {
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });
    if (!session) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid session token");
    }
    const { currentPassword, newPassword } = payload;
    const result = await auth.api.changePassword({
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });

    // reset access & refresh token
    const accessToken = authTokens.getAccessToken({
        payload: jwtPayload({ data: session }),
    });
    const refreshToken = authTokens.getRefreshToken({
        payload: jwtPayload({ data: session }),
    });

    return { ...result, accessToken, refreshToken };
};

//* logout user
const logoutUser = async ({ sessionToken }: { sessionToken: string }) => {
    return await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });
};
//* logout from all device except current user
const logoutAll = async ({ sessionToken }: { sessionToken: string }) => {
    return await auth.api.revokeOtherSessions({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`,
        }),
    });
};
export const authService = {
    registerUser,
    loginUser,
    getNewToken,
    changePassword,
    logoutUser,
    logoutAll,
};
