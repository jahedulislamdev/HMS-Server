import z from "zod";

export const IUpdateAdminPayloadSchema = z.object({
    admin: z
        .object({
            name: z
                .string("Name is required.")
                .min(3, "Name must be at least 3 characters long.")
                .max(50, "Name cannot exceed 50 characters.")
                .optional(),

            profilePhoto: z.string().optional(),
            contactNumber: z
                .string("Contact number is required.")
                .min(11, "Contact number must be at least 11 digits.")
                .max(14, "Contact number cannot exceed 14 digits.")
                .optional(),

            address: z.string().optional(),
        })
        .optional(),
});
