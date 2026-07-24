import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authTokens } from "../../utils/token";
import AppError from "../../helper/AppError";
import { cookieUtils } from "../../utils/cookie";

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
const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];

    // token check
    if (!sessionToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "session token is missing");
    }
    const result = await authService.logoutUser({
        sessionToken,
    });

    //* clear cookies after logout
    cookieUtils.clearCookie(res, "access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "user logout successfully!",
        data: result,
    });
});
const logoutAll = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];

    // token check
    if (!sessionToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "session token is missing");
    }
    const result = await authService.logoutAll({
        sessionToken,
    });

    //* clear cookies after logout
    cookieUtils.clearCookie(res, "access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "user logged out successfully!",
        data: result,
    });
});
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await authService.verifyEmail({ email, otp });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Email verified successfully!",
    });
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgetPassword({ email });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message:
            "If an account with this email exists, a password reset OTP has been sent!",
    });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword({ email, otp, newPassword });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Password reset successfully!",
    });
});

export const authController = {
    registerUser,
    loginUser,
    getNewToken,
    changePassword,
    logoutUser,
    logoutAll,
    verifyEmail,
    forgetPassword,
    resetPassword,
};
