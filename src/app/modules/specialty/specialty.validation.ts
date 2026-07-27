import z from "zod";

export const createSpecialtySchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters long.")
        .max(100, "Title cannot exceed 100 characters."),
    description: z.string().optional(),
    icon: z.string().optional(),
});
export const updateSpecialtySchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters long.")
        .max(100, "Title cannot exceed 100 characters.")
        .optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
});
