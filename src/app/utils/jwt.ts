import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const jwtUtils = {
    //* Function to create a JWT token
    createToken: (
        payload: JwtPayload,
        secret: string,
        { expiresIn }: SignOptions,
    ) => {
        return jwt.sign(payload, secret, { expiresIn });
    },
    //* Function to verify a JWT token
    verifyToken: ({ token, secret }: { token: string; secret: string }) => {
        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;
            return {
                success: true,
                data: decoded,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            return {
                success: false,
                message: e.message,
                error: e,
            };
        }
    },
    //* Function to decode a JWT token without verifying it
    decodeToken:
        () =>
        ({ token }: { token: string }) => {
            return jwt.decode(token);
        },
};
