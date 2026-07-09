import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authTokens } from "../../utils/token";

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

export const authController = { registerPatient, loginPatient };
