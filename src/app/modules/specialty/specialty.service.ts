import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload,
    });
    return specialty;
};

// get single speciality
const getSpecialty = async ({ id }: { id: string }) => {
    const specialty = await prisma.specialty.findUnique({ where: { id } });
    return specialty;
};

// get all speciality
const getAllSpecialty = async () => {
    const specialty = await prisma.specialty.findMany();
    return specialty;
};

// update speciality
const updateSpecialty = async ({
    id,
    data,
}: {
    id: string;
    data: Promise<Specialty>;
}) => {
    const specialty = await prisma.specialty.update({ where: { id }, data });
    return specialty;
};

// delete speciality
const deleteSpecialty = async ({ id }: { id: string }) => {
    const specialty = await prisma.specialty.delete({ where: { id } });
    return specialty;
};

export const specialtyService = {
    createSpecialty,
    getSpecialty,
    getAllSpecialty,
    updateSpecialty,
    deleteSpecialty,
};
