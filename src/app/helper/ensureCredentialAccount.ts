import { prisma } from "../lib/prisma";
import AppError from "./AppError";
import { StatusCodes } from "http-status-codes";

/**
 * Ensures the user has a credential (email/password) account.
 * Throws an error if the user signed up using only social providers.
 */
export const ensureCredentialAccount = async (
    userId: string,
): Promise<void> => {
    const hasCredentialAccount = await prisma.account.findFirst({
        where: {
            userId,
            providerId: "credential",
        },
    });

    if (!hasCredentialAccount) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Password changes are not available for accounts signed in with a social provider.",
        );
    }
};
