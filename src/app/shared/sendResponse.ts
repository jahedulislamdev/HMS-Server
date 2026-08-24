import { Response } from "express";

interface IResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export default function sendResponse<T>(
    res: Response,
    responseData: IResponse<T>,
) {
    const { statusCode, message, data, meta } = responseData;
    res.status(statusCode).json({
        success: true,
        message,
        data,
        meta,
    });
}
