import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { adminService } from "./admin.service";
import { StatusCodes } from "http-status-codes";

const getAdmins = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAdmins();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Admins retrieved successfully",
        data: result,
    });
});
const getAdminById = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAdminById({
        id: req.params.id as string,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Admin retrieved successfully",
        data: result,
    });
});
const updateAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.updateAdmin({
        id: req.params.id as string,
        payload: req.body,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Admin updated successfully",
        data: result,
    });
});
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.deleteAdmin({
        id: req.params.id as string,
        userId: req.user?.id as string,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Admin deleted successfully",
        data: result,
    });
});

export const adminController = {
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
};
