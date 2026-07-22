import z from "zod";

export const patientSchema = z.object({
    name: z
        .string("Name is required.")
        .min(3, "Name must be at least 3 characters long.")
        .max(50, "Name cannot exceed 50 characters."),

    email: z
        .email("Please enter a valid email address.")
        .transform((val) => val.toLowerCase()),
    password: z
        .string("Password is required.")
        .min(6, "Password must be at least 6 characters long."),
});
