import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { IUpdateDoctorPayload } from "./doctor.iterface";
import { StatusCodes } from "http-status-codes";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";

//* get all doctor
const getDoctors = async () => {
    return await prisma.doctor.findMany({
        include: {
            user: true,
            specialty: {
                include: { specialty: true },
            },
        },
    });
};

//* get doctor by id
const getDoctorById = async ({ id }: { id: string }) => {
    return await prisma.doctor.findUnique({
        where: { id },
        include: {
            user: true,
            specialty: {
                select: {
                    specialty: {
                        select: { id: true, title: true },
                    },
                },
            },
        },
    });
};

//* update doctor
const updateDoctor = async ({
    id,
    userId,
    role,
    payload,
}: {
    id: string;
    userId: string;
    role: UserRole;
    payload: IUpdateDoctorPayload;
}) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id },
    });
    if (!doctor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
    }

    const isOwner = doctor.userId === userId;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "You are not allowed to update doctor",
        );
    }
    return await prisma.doctor.update({
        where: { id },
        data: payload,
    });
};

//* Delete Doctor
const deleteDoctor = async ({
    id,
    userId,
    role,
}: {
    id: string;
    userId: string;
    role: UserRole;
}) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id },
    });

    if (!doctor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
    }

    const isOwner = doctor.userId === userId;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "You are not allowed to delete doctor",
        );
    }

    //! soft delete doctor
    return await prisma.$transaction(async (tx) => {
        await tx.doctor.update({
            where: { id },
            data: { isDeleted: true },
        });
        await tx.user.update({
            where: { id: userId },
            data: { isdeleted: true, status: UserStatus.DELETED },
        });
        await tx.session.deleteMany({
            where: { userId: doctor.userId },
        });
        await tx.account.deleteMany({
            where: { userId: doctor.userId },
        });
        return getDoctorById({ id });
    });
};

export const doctorService = {
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
