import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interface/query.Interface";

//* get all doctor
const getDoctors = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await doctorService.getDoctors(query as IQueryParams);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "doctors retrieved successfully",
        data: result,
    });
});

//* get doctor by id
const getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const result = await doctorService.getDoctorById({
        id: req.params.id as string,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "doctor retrieved successfully",
        data: result,
    });
});

//* update doctor
const updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await doctorService.updateDoctor({
        id: req.params.id as string,
        payload: req.body,
        userId: req.user?.id as string,
        role: req.user?.role as UserRole,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "doctor updated successfully",
        data: result,
    });
});

//* delete doctor
const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await doctorService.deleteDoctor({
        id: req.params.id as string,
        userId: req.user?.id as string,
        role: req.user?.role as UserRole,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "doctor delted successfully",
        data: result,
    });
});
export const doctorController = {
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
