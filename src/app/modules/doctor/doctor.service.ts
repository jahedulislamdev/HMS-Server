import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { IUpdateDoctorPayload } from "./doctor.iterface";
import { StatusCodes } from "http-status-codes";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";

//* get all doctor
const getDoctors = async () => {
    return await prisma.doctor.findMany({
        where: { isDeleted: false },
        include: {
            user: true,
            specialties: {
                select: {
                    id: true,
                    specialty: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
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
    payload,
}: {
    id: string;
    userId: string;
    role: UserRole;
    payload: IUpdateDoctorPayload;
}) => {
    // check doctor existance
    const doctor = await prisma.doctor.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!doctor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
    }
    const { doctor: doctorData, specialties } = payload;
    await prisma.$transaction(async (tx) => {
        // Update doctor information ↓
        await tx.doctor.update({ where: { id }, data: { ...doctorData } });

        // update specialties if the client provided them ↓
        if (specialties !== undefined && specialties.length > 0) {
            // check if specialties exist in the database ↓
            for (const specialty of specialties) {
                const { specialtyId, shouldDelete } = specialty;
                if (shouldDelete) {
                    await tx.doctorSpeciality.delete({
                        where: {
                            doctorId_specialityId: {
                                doctorId: id,
                                specialityId: specialtyId!,
                            },
                        },
                    });
                } else {
                    await tx.doctorSpeciality.upsert({
                        where: {
                            doctorId_specialityId: {
                                doctorId: id,
                                specialityId: specialtyId!,
                            },
                        },
                        create: {
                            doctorId: id,
                            specialityId: specialtyId!,
                        },
                        update: {},
                    });
                }
            }
        }
        return await getDoctorById({ id });
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
        select: {
            id: true,
            isDeleted: true,
            userId: true,
        },
    });

    if (!doctor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
    }

    // check if doctor is deleted
    if (doctor.isDeleted) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Doctor has already been deleted.",
        );
    }
    const canDelete =
        doctor.userId === userId ||
        role === UserRole.ADMIN ||
        role === UserRole.SUPER_ADMIN;

    if (!canDelete) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to delete this doctor.",
        );
    }

    // soft delete doctor
    await prisma.$transaction(async (tx) => {
        // Mark doctor as deleted , user delete as a doctor but not as user
        await tx.doctor.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        await Promise.all([
            tx.user.update({
                where: { id: doctor.userId },
                data: {
                    isDeleted: true,
                    status: UserStatus.DELETED,
                    deletedAt: new Date(),
                },
            }),
            tx.session.deleteMany({
                where: { userId: doctor.userId },
            }),
            // Consider whether this should remain if using soft deletes.
            tx.doctorSpeciality.deleteMany({
                where: { doctorId: id },
            }),
        ]);
        return {
            id,
        };
    });
};

export const doctorService = {
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
