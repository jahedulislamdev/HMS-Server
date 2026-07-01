//! This is used to define a custom error class for the application.
export default class AppError extends Error {
    public statusCode: number;
    constructor(statusCode: number, message: string, stack: string = "") {
        super(message);
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
