import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import AppError from "../app/helper/AppError";
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    BETTER_AUTH_URL: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_EXPIRATION: string;
    BETTER_AUTH_TOKEN_EXPIRATION: string;
    BETTER_AUTH_TOKEN_UPDATE_AGE: string;
    BETTER_AUTH_TOKEN_COOKIE_CACHE_MAX_AGE: string;
}

const loadEnvVariables = (): EnvConfig => {
    //! env validation check
    const requiredEnvVariables = [
        "NODE_ENV",
        "PORT",
        "BETTER_AUTH_URL",
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
        "ACCESS_TOKEN_SECRET",
        "REFRESH_TOKEN_SECRET",
        "ACCESS_TOKEN_EXPIRATION",
        "REFRESH_TOKEN_EXPIRATION",
        "BETTER_AUTH_TOKEN_EXPIRATION",
        "BETTER_AUTH_TOKEN_UPDATE_AGE",
        "BETTER_AUTH_TOKEN_COOKIE_CACHE_MAX_AGE",
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
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
        ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION as string,
        REFRESH_TOKEN_EXPIRATION: process.env
            .REFRESH_TOKEN_EXPIRATION as string,
        BETTER_AUTH_TOKEN_EXPIRATION: process.env
            .BETTER_AUTH_TOKEN_EXPIRATION as string,
        BETTER_AUTH_TOKEN_UPDATE_AGE: process.env
            .BETTER_AUTH_TOKEN_UPDATE_AGE as string,
        BETTER_AUTH_TOKEN_COOKIE_CACHE_MAX_AGE: process.env
            .BETTER_AUTH_TOKEN_COOKIE_CACHE_MAX_AGE as string,
    };
};
export const envVars = loadEnvVariables();
