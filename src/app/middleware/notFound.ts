import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function notFoundHandler(req: Request, res: Response) {
    res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        message: "Route Not Found!",
        method: req.method,
        path: req.originalUrl,
        date: new Date().toISOString,
    });
}
