import { UserRole } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

const createDoctor = async ({ payload }: { payload: ICreateDoctorPayload }) => {
    // if (role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN) {
    //     throw new Error("You are not authorized to create doctor");
    // }
    // console.log(payload);
    const { doctor, specialties, password } = payload;
    //* check if specialty exist
    const specialty = await prisma.specialty.findMany({
        where: { id: { in: payload.specialties } },
    });

    // console.log("payload specialty", payload.specialties);
    // console.log(specialty);

    if (specialty.length !== specialties.length) {
        throw new Error("One or more specialties you selected does not exist");
    }

    //! check if user already exists
    const userExist = await prisma.user.findUnique({
        where: { email: payload.doctor.email },
    });
    if (userExist) {
        throw new Error("user with this email already exists");
    }

    //* create user
    const userData = await auth.api.signUpEmail({
        body: {
            email: doctor.email,
            password: password,
            role: UserRole.DOCTOR,
            name: doctor.name,
            needPasswordChange: true,
        },
    });

    //* create doctor and specialties
    try {
        return await prisma.$transaction(async (tx) => {
            //! check for unique registration number
            const regNumExist = await tx.doctor.findUnique({
                where: {
                    registrationNumber: payload.doctor.registrationNumber,
                },
            });
            if (regNumExist) {
                throw new Error(
                    "Doctor with this registration number already exists",
                );
            }

            //* create doctor
            const doctor = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor,
                },
            });
            const doctorSpecialties = specialty.map((s) => {
                return { doctorId: doctor.id, specialityId: s.id };
            });

            //* create specialties on doctorspecialty table
            await tx.doctorSpeciality.createMany({
                data: doctorSpecialties,
            });

            //* we can send selected doctor data which we need to send to the client in future
            return await tx.doctor.findUnique({
                where: { id: doctor.id },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    contactNumber: true,
                    designation: true,
                    experience: true,
                    address: true,
                    specialty: {
                        select: {
                            specialty: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            emailVerified: true,
                            isDeleted: true,
                            deletedAt: true,
                            status: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    } catch (e) {
        await prisma.user.delete({ where: { id: userData.user.id } });
        console.error("Transaction Error:", e);
        throw e;
    }
};

export const userService = { createDoctor };
