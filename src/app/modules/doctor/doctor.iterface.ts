import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorPayload {
    name?: string;
    profilePhoto?: string;
    address?: string;
    gender?: Gender;
    contactNumber?: string;
    qualification: string;
    experience?: number;
    currentWorkplace?: string;
    designation?: string;
    registrationNumber?: string;
    appointmentFee?: number;
    specialties?: string[];
}
