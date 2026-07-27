import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import AppError from "./AppError";
import { auth } from "../lib/auth";

export const validateResetPasswordUser = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

    if (!user.emailVerified)
        throw new AppError(StatusCodes.BAD_REQUEST, "Email is not verified");

    if (
        user.deletedAt ||
        user.status === "BLOCKED" ||
        user.status === "DELETED"
    ) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "User account is not active",
        );
    }

    return user;
};

//* safer version to prevent email enumeration.
export const validateResetPasswordUserSaferVersion = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (
        !user ||
        !user.emailVerified ||
        user.deletedAt ||
        user.status === "BLOCKED" ||
        user.status === "DELETED"
    ) {
        return;
    }
    await auth.api.requestPasswordResetEmailOTP({
        body: { email },
    });
};
