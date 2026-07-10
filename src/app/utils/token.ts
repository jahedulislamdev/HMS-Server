import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "./../../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";
import { jwtUtils } from "./jwt";

export const authTokens = {
    getAccessToken({ payload }: { payload: JwtPayload }) {
        return jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, {
            expiresIn: envVars.ACCESS_TOKEN_EXPIRATION,
        } as SignOptions);
    },
    getRefreshToken({ payload }: { payload: JwtPayload }) {
        return jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, {
            expiresIn: envVars.REFRESH_TOKEN_EXPIRATION,
        } as SignOptions);
    },
    setAccessTokenCookie({ res, token }: { res: Response; token: string }) {
        // console.log(token);

        cookieUtils.setCookie(res, "access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
            path: "/",
        });
    },
    setRefreshTokenCookie({ res, token }: { res: Response; token: string }) {
        cookieUtils.setCookie(res, "refresh_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 60 * 24 * 7, // 7 days in milliseconds
            path: "/",
        });
    },
    setBetterAuthSessionTokenCookie({
        res,
        token,
    }: {
        res: Response;
        token: string;
    }) {
        cookieUtils.setCookie(res, "better-auth.session_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 60 * 24, // 1 day in milliseconds
            path: "/",
        });
    },
};
