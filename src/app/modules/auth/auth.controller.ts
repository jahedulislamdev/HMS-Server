import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authTokens } from "../../utils/token";
import AppError from "../../helper/AppError";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    const { accessToken, refreshToken, token } = result;

    authTokens.setAccessTokenCookie({ res, token: accessToken });
    authTokens.setRefreshTokenCookie({ res, token: refreshToken });
    authTokens.setBetterAuthSessionTokenCookie({ res, token: token! });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "patient register successfully!",
        data: result,
    });
});
const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    const { accessToken, refreshToken, token } = result;

    authTokens.setAccessTokenCookie({ res, token: accessToken });
    authTokens.setRefreshTokenCookie({ res, token: refreshToken });
    authTokens.setBetterAuthSessionTokenCookie({ res, token });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "patient login successfully!",
        data: result,
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
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];

    // token check
    if (!sessionToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "session token is missing");
    }
    const result = await authService.changePassword({
        payload: req.body,
        sessionToken,
    });
    authTokens.setAccessTokenCookie({ res, token: result.accessToken });
    authTokens.setRefreshTokenCookie({ res, token: result.refreshToken });
    authTokens.setBetterAuthSessionTokenCookie({ res, token: result.token! });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "password changed successfully!",
        data: result,
    });
});

export const authController = {
    registerUser,
    loginUser,
    getNewToken,
    changePassword,
};
