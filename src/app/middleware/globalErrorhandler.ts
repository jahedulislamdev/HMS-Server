/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { envVars } from "../../config/env";
import { StatusCodes } from "http-status-codes";

// global error handler
export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (envVars.NODE_ENV === "development") {
        console.log("Error From Global Err Handler :", err);
    }

    let status: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message: string = "Internal server Error";
    let errorDetails: unknown = null;

    // prisma errors
    //! Validation error (missing / wrong field)
    if (err instanceof Error) {
        status = 400;
        message = err.message;
        errorDetails = err.stack;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                status = 409;
                message = `Duplicate value. This record already exists.`;
                errorDetails = err.meta;
                break;

            case "P2025":
                status = 404;
                message = "Requested resource not found.";
                errorDetails = err.meta;
                break;

            case "P2003":
                status = 400;
                message = "Invalid reference (foreign key failed).";
                errorDetails = err.meta;
                break;

            case "P2014":
                status = 400;
                message = "Invalid relation between records.";
                errorDetails = err.meta;
                break;

            default:
                status = 400;
                message = "Database error occurred.";
                errorDetails = err.message;
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        status = 400;
        message = "Invalid or missing input data. Please check your fields.";
        errorDetails = err.message;
    } //! Prisma DB connection issue
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        status = 500;
        message = "Database connection failed.Try again later.";
        errorDetails = err.message;
    }
    //! Prisma unknown error
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        status = 500;
        message = "Unknown database error.";
        errorDetails = err.message;
    } else if (err.statusCode && err.message) {
        status = err.statusCode;
        message = err.message;
        errorDetails = err.error ?? null;
    }
    //!  Prisma Rust panic error (CRITICAL)
    else if (err instanceof Prisma.PrismaClientRustPanicError) {
        status = 500;
        message = "Critical database engine error.";
        errorDetails = err.message;
    }
    //! Syntax Error (invalid JSON)
    else if (err instanceof SyntaxError && "body" in err) {
        status = 400;
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
            process.env.NODE_ENV === "development" ? errorDetails : undefined,
    });
}
