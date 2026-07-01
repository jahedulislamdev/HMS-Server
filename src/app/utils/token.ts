import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "./../../config/env";

export const authTokens = {
    getAccessToken({ payload }: { payload: JwtPayload }) {
        return jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, {
            expiresIn: envVars.ACCESS_TOKEN_EXPIRATION,
        } as SignOptions);
    },
    getRefreshToken({ payload }: { payload: JwtPayload }) {
        return jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, {
            expiresIn: envVars.REFRESH_TOKEN_EXPIRATION,
        } as SignOptions);
    },
};
