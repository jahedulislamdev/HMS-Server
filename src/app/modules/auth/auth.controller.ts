import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authTokens } from "../../utils/token";
import AppError from "../../helper/AppError";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerPatient(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    authTokens.setAccessTokenCookie({ res, token: accessToken });
    authTokens.setRefreshTokenCookie({ res, token: refreshToken });
    authTokens.setBetterAuthSessionTokenCookie({ res, token: token! });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "patient register successfully!",
        data: { accessToken, refreshToken, token, ...rest },
    });
});
const loginPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginPatient(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    authTokens.setAccessTokenCookie({ res, token: accessToken });
    authTokens.setRefreshTokenCookie({ res, token: refreshToken });
    authTokens.setBetterAuthSessionTokenCookie({ res, token });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "patient login successfully!",
        data: { accessToken, refreshToken, token, ...rest },
    });
});
const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const refreshToken = req.cookies["refresh_token"];

    // token check
    if (!sessionToken && !refreshToken) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "session token or refresh token is missing",
        );
    }
    const result = await authService.getNewToken({
        refreshToken,
        sessionToken,
    });

    // set new token in cookie
    authTokens.setAccessTokenCookie({ res, token: result.accessToken });
    authTokens.setAccessTokenCookie({ res, token: result.refreshToken });
    authTokens.setAccessTokenCookie({ res, token: result.sessionToken });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "token retreived successfully!",
        data: result,
    });
});

export const authController = { registerPatient, loginPatient, getNewToken };
