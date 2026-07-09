import { CookieOptions, Request, Response } from "express";

export const cookieUtils = {
    // Function to set a cookie in the response
    setCookie: (
        res: Response,
        key: string,
        value: string,
        options: CookieOptions,
    ) => {
        res.cookie(key, value, options);
    },
    // Function to get a cookie from the request
    getCookie: (req: Request, key: string) => {
        return req.cookies[key];
    },
    // Function to clear a cookie in the response
    clearCookie: (res: Response, key: string, options?: CookieOptions) => {
        res.clearCookie(key, options);
    },
};
