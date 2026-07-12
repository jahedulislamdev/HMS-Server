import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpecialtyPayload {
    specialtyId?: string;
    shouldDelete?: boolean;
}
export interface IUpdateDoctorPayload {
    doctor?: {
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
    };
    specialties?: IUpdateDoctorSpecialtyPayload[];
}
