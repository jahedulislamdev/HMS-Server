import { StatusCodes } from "http-status-codes";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";
import { UserStatus } from "../../../generated/prisma/enums";

//* get all admin
const getAdmins = async () => {
    return await prisma.admin.findMany();
};

//* get admin by id
const getAdminById = async (id: string) => {
    const isAdminExist = await prisma.admin.findUnique({ where: { id } });
    if (!isAdminExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Admin Or Super Admin not found",
        );
    }
    return await prisma.admin.findUnique({
        where: { id },
        include: { user: true },
    });
};

//* update admin
const updateAdmin = async ({
    id,
    payload,
}: {
    id: string;
    payload: IUpdateAdminPayload;
}) => {
    const isAdminExist = await prisma.admin.findUnique({ where: { id } });
    if (!isAdminExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Admin Or Super Admin not found",
        );
    }
    const { admin } = payload;
    return await prisma.admin.update({
        where: { id },
        data: { ...admin },
    });
};

//! soft delete admin allow only super admin
const deleteAdmin = async ({ id, userId }: { id: string; userId: string }) => {
    const isAdminExist = await prisma.admin.findUnique({ where: { id } });
    if (!isAdminExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Admin Or Super Admin not found",
        );
    }
    if (isAdminExist.userId === userId) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "You cannot delete your own account",
        );
    }
    return await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        await tx.user.update({
            where: { id: userId },
            data: { isDeleted: true, status: UserStatus.DELETED },
        });
        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId },
        });
        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId },
        });
        return getAdminById(id);
    });
};

export const adminService = {
    getAdmins,
    updateAdmin,
    deleteAdmin,
    getAdminById,
};
