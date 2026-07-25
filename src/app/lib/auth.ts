import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { envVars } from "../../config/env";
import { UserRole } from "./../../generated/prisma/enums";

const oneDayInSeconds = 60 * 60 * 60 * 24;
const OTP_EXPIRES_IN = 2 * 60;

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: () => {
                return {
                    role: UserRole.PATIENT,
                    status: UserStatus.ACTIVE,
                    needpasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null,
                };
            },
        },
    },

    emailVerification: {
        sendOnSignIn: true,
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: UserRole.PATIENT,
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE,
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null,
            },
        },
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (user && !user.emailVerified) {
                        await sendEmail({
                            subject: "Verify Your Email",
                            to: email,
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp,
                                expiryMinutes: OTP_EXPIRES_IN / 60,
                            },
                        });
                    }
                } else if (type === "forget-password") {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });
                    if (user) {
                        sendEmail({
                            subject: "Password Reset OTP",
                            templateName: "otp",
                            to: email,
                            templateData: {
                                name: user.name,
                                otp,
                                expiryMinutes: OTP_EXPIRES_IN / 60,
                            },
                        });
                    }
                }
            },
            expiresIn: OTP_EXPIRES_IN,
            otpLength: 6,
        }),
    ],
    session: {
        expiresIn: oneDayInSeconds,
        updateAge: oneDayInSeconds,
        cookieCache: {
            enabled: true,
            maxAge: oneDayInSeconds,
        },
    },
    advanced: {
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    secure: true,
                    sameSite: "none",
                    httpOnly: true,
                    path: "/",
                },
            },
            sessionToken: {
                attributes: {
                    secure: true,
                    sameSite: "none",
                    httpOnly: true,
                    path: "/",
                },
            },
        },
    },
});
