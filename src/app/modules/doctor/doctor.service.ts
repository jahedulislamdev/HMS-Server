import { StatusCodes } from "http-status-codes";
import { UserRole } from "../../../generated/prisma/enums";
import AppError from "../../helper/Apperror";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.iterface";
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
    // check doctor existance
    const doctor = await prisma.doctor.findUnique({
        where: { id },
    });

    if (!doctor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
    }
    // check authorization
    const isOwner = doctor.userId === userId;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "You are not allowed to update this doctor.",
        );
    }
    const { specialties, ...doctorData } = payload;

    //* update doctor
    await prisma.$transaction(async (tx) => {
        // Update doctor information
        await tx.doctor.update({ where: { id }, data: doctorData });
        // update specialties if the client provided them

        if (specialties !== undefined && specialties.length > 0) {
            // check if specialties exist in the database
            const existingSpecialties = await tx.specialty.findMany({
                where: { id: { in: specialties } },
                select: { id: true },
            });
            if (existingSpecialties.length !== specialties.length) {
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    "One or more specialties you selected does not exist",
                );
            }
            // Delete old specialties
            await tx.doctorSpeciality.deleteMany({
                where: { doctorId: id },
            });

            // insert new specialties
            if (specialties !== undefined && specialties.length > 0) {
                await tx.doctorSpeciality.createMany({
                    data: specialties.map((s) => ({
                        doctorId: id,
                        specialityId: s,
                    })),
                });
            }
        }
    });
    const updatedDoctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
            specialties: {
                include: {
                    specialty: true,
                },
            },
        },
    });

    return {
        ...updatedDoctor,
        specialties: updatedDoctor?.specialties?.map((s) => s.specialty) || [],
    };
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
    return await prisma.doctor.update({
        where: { id },
        data: { isDeleted: true },
    });
};
export const doctorService = {
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
