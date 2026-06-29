import { Gender } from "../../../generated/prisma/enums";

export interface ICreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        address?: string;
        gender: Gender;
        contactNumber?: string;
        qualification?: string;
        experience: number;
        currentWorkplace: string;
        designation: string;
        registrationNumber: string;
        appointmentFee: number;
    };
    specialties: string[];
}
