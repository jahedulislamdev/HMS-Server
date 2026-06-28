import { Response } from "express";

interface IResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
}
export default function sendResponse<T>(
    res: Response,
    responseData: IResponse<T>,
) {
    const { statusCode, message, data } = responseData;
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}
