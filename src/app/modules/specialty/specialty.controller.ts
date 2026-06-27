import { Request, Response } from "express";
import { specialtyService } from "./specialty.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

//* create speciality
const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await specialtyService.createSpecialty(payload);
    sendResponse(res, {
        statusCode: 201,
        message: "specialty create successfully",
        data: result,
    });
});

//* get single speciality
const getSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await specialtyService.getSpecialty({
        id: req.params.id as string,
    });
    sendResponse(res, {
        statusCode: 200,
        message: "specialty retrieved successfully",
        data: result,
    });
});

//* get all speciality
const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await specialtyService.getAllSpecialty();
    sendResponse(res, {
        statusCode: 200,
        message: "specialty retrieved successfully",
        data: result,
    });
});

//* update speciality
const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await specialtyService.updateSpecialty({
        id: req.params.id as string,
        data: req.body,
    });
    sendResponse(res, {
        statusCode: 200,
        message: "specialty updated successfully",
        data: result,
    });
});

//* delete speciality
const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const result = await specialtyService.deleteSpecialty({
        id: req.params.id as string,
    });
    sendResponse(res, {
        statusCode: 201,
        message: "specialty deleted successfully",
        data: result,
    });
});

export const specialtyController = {
    createSpecialty,
    getAllSpecialty,
    updateSpecialty,
    deleteSpecialty,
    getSpecialty,
};
