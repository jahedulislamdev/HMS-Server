import z from "zod";
import { Gender, UserRole } from "../../../generated/prisma/enums";

export const doctorSchema = z.object({
    password: z
        .string("Password is required.")
        .min(6, "Password must be at least 6 characters long."),

    doctor: z.object({
        name: z
            .string("Name is required.")
            .min(3, "Name must be at least 3 characters long.")
            .max(50, "Name cannot exceed 50 characters."),

        email: z
            .email("Please enter a valid email address.")
            .transform((val) => val.toLowerCase()),

        contactNumber: z
            .string("Contact number is required.")
            .min(11, "Contact number must be at least 11 digits.")
            .max(14, "Contact number cannot exceed 14 digits."),

        address: z.string().optional(),

        registrationNumber: z.string("Registration number is required."),

        experience: z
            .int("Experience must be a whole number.")
            .nonnegative("Experience cannot be negative."),

        gender: z.enum(
            [Gender.MALE, Gender.FEMALE],
            "Gender must be either 'MALE' or 'FEMALE'.",
        ),

        appointmentFee: z
            .number("Appointment fee must be a valid number.")
            .nonnegative("Appointment fee cannot be negative."),

        qualification: z
            .string("Qualification is required.")
            .min(3, "Qualification must be at least 3 characters long.")
            .max(50, "Qualification cannot exceed 50 characters."),

        currentWorkplace: z
            .string("Current workplace is required.")
            .min(3, "Current workplace must be at least 3 characters long.")
            .max(50, "Current workplace cannot exceed 50 characters."),

        designation: z
            .string("Designation is required.")
            .min(3, "Designation must be at least 3 characters long.")
            .max(50, "Designation cannot exceed 50 characters."),
    }),

    specialties: z
        .array(z.uuid("Each specialty must be a valid UUID."))
        .min(1, "Please select at least one specialty."),
});

export const adminSchema = z.object({
    password: z
        .string("Password is required.")
        .min(6, "Password must be at least 6 characters long."),

    admin: z.object({
        name: z
            .string("Name is required.")
            .min(3, "Name must be at least 3 characters long.")
            .max(50, "Name cannot exceed 50 characters."),

        email: z
            .email("Please enter a valid email address.")
            .transform((val) => val.toLowerCase()),

        contactNumber: z
            .string("Contact number is required.")
            .min(11, "Contact number must be at least 11 digits.")
            .max(14, "Contact number cannot exceed 14 digits.")
            .optional(),

        profilePhoto: z.string().optional(),
        address: z
            .string()
            .max(200, "Address cannot exceed 200 characters.")
            .optional(),
    }),
    role: z.enum(
        [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        "Role must be either 'ADMIN' or 'SUPER_ADMIN'.",
    ),
});
