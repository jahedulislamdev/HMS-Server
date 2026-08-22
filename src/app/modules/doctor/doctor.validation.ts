import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateDoctorSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(3, "Doctor name must be at least 3 characters long.")
            .max(50, "Doctor name cannot exceed 50 characters."),

        profilePhoto: z.string().url("Profile photo must be a valid URL."),

        address: z
            .string()
            .trim()
            .min(5, "Address must be at least 5 characters long.")
            .max(100, "Address cannot exceed 255 characters."),

        gender: z.enum(Gender, {
            error: "Gender must be either MALE or FEMALE.",
        }),

        contactNumber: z
            .string()
            .trim()
            .length(14, "Contact number must be exactly 14 characters long.")
            .regex(
                /^\+8801\d{9}$/,
                "Contact number must be a valid Bangladeshi mobile number (e.g. +8801XXXXXXXXX).",
            ),

        qualification: z
            .string()
            .trim()
            .min(2, "Qualification is required.")
            .max(150, "Qualification cannot exceed 150 characters."),

        experience: z
            .number()
            .int("Experience must be a whole number.")
            .min(0, "Experience cannot be negative.")
            .max(60, "Experience cannot exceed 60 years."),

        currentWorkingPlace: z
            .string()
            .trim()
            .min(2, "Current workplace must be at least 2 characters long.")
            .max(150, "Current workplace cannot exceed 150 characters."),

        designation: z
            .string()
            .trim()
            .min(2, "Designation must be at least 2 characters long.")
            .max(100, "Designation cannot exceed 100 characters."),

        registrationNumber: z
            .string()
            .trim()
            .min(3, "Registration number is required.")
            .max(50, "Registration number cannot exceed 50 characters."),

        appointmentFee: z
            .number()
            .positive("Appointment fee must be greater than 0."),

        specialties: z
            .array(z.string().uuid("Each specialty must be a valid UUID."))
            .min(1, "At least one specialty is required."),
    })
    .partial();
