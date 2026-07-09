/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../helper/AppError";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export default function checkAuth(...authRoles: UserRole[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            //* session token verify
            const sessionToken = cookieUtils.getCookie(
                req,
                "better-auth.session_token",
            );
            if (!sessionToken) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    "Unauthorized: No session token provided",
                );
            }
            if (sessionToken) {
                const sessionExists = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: { gt: new Date() },
                    },
                    include: { user: true },
                });
                if (sessionExists && sessionExists.user) {
                    const user = sessionExists.user;
                    const now = new Date();
                    const expiresAt = new Date(sessionExists.expiresAt);
                    const createdAt = new Date(sessionExists.createdAt);
                    const sessionDuration =
                        expiresAt.getTime() - createdAt.getTime();
                    const timeRemaining = expiresAt.getTime() - now.getTime();
                    const persentageRemaining =
                        (timeRemaining / sessionDuration) * 100;
                    if (persentageRemaining < 20) {
                        res.setHeader("X-Session-Refresh", "true");
                        res.setHeader(
                            "X-Session-Expires-At",
                            expiresAt.toISOString(),
                        );
                        res.setHeader(
                            "X-Time-Remaining",
                            timeRemaining.toString(),
                        );
                        console.log("session expiring soon!");
                    }
                    if (
                        user.status === UserStatus.BLOCKED ||
                        user.status === UserStatus.DELETED
                    ) {
                        throw new AppError(
                            StatusCodes.FORBIDDEN,
                            "User is not active",
                        );
                    }
                    if (user.isDeleted) {
                        throw new AppError(
                            StatusCodes.FORBIDDEN,
                            "User is deleted",
                        );
                    }
                    if (
                        authRoles.length > 0 &&
                        !authRoles.includes(user.role as UserRole)
                    ) {
                        throw new AppError(
                            StatusCodes.FORBIDDEN,
                            "User does not have permission to access this resource",
                        );
                    }
                }
            }

            //* access token verify
            const accessToken = cookieUtils.getCookie(req, "access_token");
            if (!accessToken) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    "Unauthorized: No access token provided",
                );
            }
            const verrifyAccessToken = jwtUtils.verifyToken({
                token: accessToken,
                secret: envVars.ACCESS_TOKEN_SECRET,
            });
            if (!verrifyAccessToken.success) {
                throw new AppError(
                    StatusCodes.UNAUTHORIZED,
                    "Unauthorized access: Invalid access token",
                );
            }
            if (
                authRoles.length > 0 &&
                !authRoles.includes(verrifyAccessToken.data!.role as UserRole)
            ) {
                throw new AppError(
                    StatusCodes.FORBIDDEN,
                    "User does not have permission to access this resource",
                );
            }
            next();
        } catch (err: any) {
            next(err);
        }
    };
}
