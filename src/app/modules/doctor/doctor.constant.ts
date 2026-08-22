import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
    "name",
    "email",
    "qualification",
    "currentWorkingPlace",
    "registrationNumber",
    "specialties.specialty.title",
];

export const doctorFilterableFields = [
    "gender",
    "isDeleted",
    "appointmentFee",
    "experience",
    "registrationNumber",
    "specialties.specialityId",
    "currentWorkingPlace",
    "designation",
    "qualification",
    "specialties.specialty.title",
];

export const doctorIncludeConfig: Partial<
    Record<
        keyof Prisma.DoctorInclude,
        Prisma.DoctorInclude[keyof Prisma.DoctorInclude]
    >
> = {
    user: true,
    specialties: {
        include: {
            specialty: true,
        },
    },
    appointments: {
        include: {
            patient: true,
            doctor: true,
            prescription: true,
        },
    },
    doctorSchedules: {
        include: {
            schedule: true,
        },
    },
    reviews: true,
    prescriptions: true,
};
