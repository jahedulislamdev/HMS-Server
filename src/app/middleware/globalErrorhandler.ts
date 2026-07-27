/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { envVars } from "../../config/env";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { deleteFileFromCloudinary } from "../../config/cloudinary.congig";

// global error handler
export async function errorHandler(
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) {
    let status: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message: string = "Internal server Error";
    let errorDetails: unknown = null;

    //!delete cloudinary file when throw uploading error
    // single file
    if (req.file) {
        await deleteFileFromCloudinary(req.file.path);
    }
    // multiple file
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((f) => f.path);
        await Promise.all(
            imageUrls.map((url) => deleteFileFromCloudinary(url)),
        );
    }
    //! zod validation error
    if (err instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid input data.",
            errorSource: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    //* prisma errors
    //! Validation error (missing / wrong field)
    if (err instanceof Error) {
        status = StatusCodes.BAD_REQUEST;
        message = err.message;
        errorDetails =
            envVars.NODE_ENV === "development" ? err.stack : undefined;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                status = StatusCodes.CONFLICT;
                message = `Duplicate value. This record already exists.`;
                errorDetails = err.meta;
                break;

            case "P2025":
                status = StatusCodes.NOT_FOUND;
                message = "Requested resource not found.";
                errorDetails = err.meta;
                break;

            case "P2003":
                status = StatusCodes.BAD_REQUEST;
                message = "Invalid reference (foreign key failed).";
                errorDetails = err.meta;
                break;

            case "P2014":
                status = StatusCodes.BAD_REQUEST;
                message = "Invalid relation between records.";
                errorDetails = err.meta;
                break;

            default:
                status = StatusCodes.BAD_REQUEST;
                message = "Database error occurred.";
                errorDetails = err.message;
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        status = StatusCodes.BAD_REQUEST;
        message = "Invalid or missing input data. Please check your fields.";
        errorDetails = err.message;
    } //! Prisma DB connection issue
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        message = "Database connection failed.Try again later.";
        errorDetails = err.message;
    }
    //! Prisma unknown error
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        message = "Unknown database error.";
        errorDetails = err.message;
    } else if (err.statusCode && err.message) {
        status = err.statusCode;
        message = err.message;
        errorDetails = err.error ?? null;
    }
    //!  Prisma Rust panic error (CRITICAL)
    else if (err instanceof Prisma.PrismaClientRustPanicError) {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        message = "Critical database engine error.";
        errorDetails = err.message;
    }
    //! Syntax Error (invalid JSON)
    else if (err instanceof SyntaxError && "body" in err) {
        status = StatusCodes.BAD_REQUEST;
        message = "Invalid JSON format.";
    }
    //! Known request error (unique, not found, FK, etc.)
    else {
        //? FALLBACK
        errorDetails = err?.message || err;
    }
    res.status(status).json({
        success: false,
        message,
        errorDetails:
            envVars.NODE_ENV === "development" ? errorDetails : undefined,
    });
}
