import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../helper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { authTokens } from "../../utils/token";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

//* Register Patient (user will automatically login after register)
const registerPatient = async (payload: IRegisterPatientPayload) => {
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
            payload: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.role,
                emailVerified: data.user.emailVerified,
                isDeleted: data.user.isDeleted,
                status: data.user.status,
            },
        });
        const refreshToken = authTokens.getRefreshToken({
            payload: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.role,
                emailVerified: data.user.emailVerified,
                isDeleted: data.user.isDeleted,
                status: data.user.status,
            },
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

interface ILoginUserPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

//* Login Patient
const loginPatient = async (payload: ILoginUserPayload) => {
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
        payload: {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
            status: data.user.status,
        },
    });
    const refreshToken = authTokens.getRefreshToken({
        payload: {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
            status: data.user.status,
        },
    });

    return { ...data, accessToken, refreshToken };
};

export const authService = { registerPatient, loginPatient };
