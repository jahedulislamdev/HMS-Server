import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { scheduleService } from "./schedule.service";
import { IQueryParams } from "../../interface/query.Interface";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.createSchedules(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "schedule created successfully",
        data: result,
    });
});
const getSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.getSchedule(req.params.id as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "schedule fetched successfully",
        data: result,
    });
});
const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.getAllSchedules(
        req.query as IQueryParams,
    );
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "schedules fetched successfully",
        data: result,
    });
});
const updateSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.updateSchedules({
        id: req.params.id as string,
        payload: req.body,
    });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "schedules updated successfully",
        data: result,
    });
});
const deleteSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.deleteSchedules(
        req.params.id as string,
    );
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "schedules deleted successfully",
        data: { id: result.id },
    });
});
export const scheduleController = {
    createSchedule,
    getSchedule,
    getAllSchedules,
    updateSchedules,
    deleteSchedules,
};
