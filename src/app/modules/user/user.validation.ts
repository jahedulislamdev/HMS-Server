import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const doctorSchema = z.object({
    password: z
        .string("password is required")
        .min(6, "Password must be at least 6 characters long"),
    doctor: z.object({
        name: z
            .string("name is required and must be string")
            .min(3, "Name must be at least 3 characters long")
            .max(50, "Name must be at most 50 characters long"),
        email: z.email("Invalid email").transform((val) => val.toLowerCase()),
        contactNumber: z
            .string("contactNumber is required")
            .min(11, "contactNumber must be at least 11 characters long")
            .max(14, "contactNumber must be at most 14 characters long"),

        address: z.string("address is required").optional(),
        registrationNumber: z.string("Registration number is required"),
        experience: z
            .int("Experience must be an integer")
            .nonnegative("Experience must be positive number"),

        gender: z.enum(
            [Gender.MALE, Gender.FEMALE],
            "Gender must be either 'MALE' or 'FEMALE'",
        ),
        appointmentFee: z
            .number("appointmentFee must be a number")
            .nonnegative("appointmentFee must be positive number"),
        qualification: z
            .string("qualification is required")
            .min(3, "qualification must be at least 3 characters long")
            .max(50, "qualification must be at most 50 characters long"),
        currentWorkplace: z
            .string("currentworking place is required")
            .min(3, "currentworking place must be at least 3 characters long")
            .max(50, "currentworking place must be at most 50 characters long"),

        designation: z
            .string("designation is required")
            .min(3, "designation must be at least 3 characters long")
            .max(50, "designation must be at most 50 characters long"),
    }),
    specialties: z.array(z.uuid()).min(1, "At least one specialty is required"),
});
