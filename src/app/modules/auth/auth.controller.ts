import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerPatient(req.body);
    sendResponse(res, {
        statusCode: 201,
        message: "patient register successfully!",
        data: result,
    });
});
const loginPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginPatient(req.body);
    sendResponse(res, {
        statusCode: 200,
        message: "patient login successfully!",
        data: result,
    });
});

export const authController = { registerPatient, loginPatient };
