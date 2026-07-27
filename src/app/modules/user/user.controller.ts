import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.createDoctor({
        payload: req.body,
        role: req.user?.role,
    });
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        data: result,
        message: "Doctor created successfully",
    });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.createDoctor({
        payload: req.body,
        role: req.user?.role,
    });
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        data: result,
        message: "Admin created successfully",
    });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getMe({ userId: req.user?.id as string });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        data: result,
        message: "user reterived successfully",
    });
});

export const userController = { createDoctor, createAdmin, getMe };
