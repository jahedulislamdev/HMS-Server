import { prisma } from "../../lib/prisma";
import {
    ISpecialtyCreatePayload,
    ISpecialtyUpdatePayload,
} from "./specialty.interface";

const createSpecialty = async (payload: ISpecialtyCreatePayload) => {
    // check if specialty already exists
    const specialtyExist = await prisma.specialty.findUnique({
        where: { title: payload.title },
    });

    if (specialtyExist) {
        throw new Error(
            "Specialty already exists, Can't create duplicate specialty using the same name",
        );
    }
    return await prisma.specialty.create({
        data: payload,
    });
};

// get single speciality
const getSpecialty = async ({ id }: { id: string }) => {
    return await prisma.specialty.findUnique({ where: { id } });
};

// get all speciality
const getAllSpecialty = async () => {
    return await prisma.specialty.findMany();
};

// update speciality
const updateSpecialty = async ({
    id,
    data,
}: {
    id: string;
    data: ISpecialtyUpdatePayload;
}) => {
    return await prisma.specialty.update({ where: { id }, data });
};

// delete speciality
const deleteSpecialty = async ({ id }: { id: string }) => {
    return await prisma.specialty.delete({ where: { id } });
};

export const specialtyService = {
    createSpecialty,
    getSpecialty,
    getAllSpecialty,
    updateSpecialty,
    deleteSpecialty,
};
