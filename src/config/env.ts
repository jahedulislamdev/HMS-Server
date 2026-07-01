import dotenv from "dotenv";
import AppError from "../app/helper/Apperror";
import { StatusCodes } from "http-status-codes";
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    BETTER_AUTH_URL: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
}

const loadEnvVariables = (): EnvConfig => {
    // env validation check
    const requiredEnvVariables = [
        "NODE_ENV",
        "PORT",
        "BETTER_AUTH_URL",
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
    ];
    requiredEnvVariables.forEach((v) => {
        if (!process.env[v]) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                `Environment Variable ${v} is required but not set in .env file`,
            );
        }
    });
    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    };
};
export const envVars = loadEnvVariables();
