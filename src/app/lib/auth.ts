import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

const oneDayInSeconds = 60 * 60 * 60 * 24;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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
                            subject: "Verify your email",
                            to: email,
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp,
                            },
                        });
                    }
                }
            },
            expiresIn: 2 * 60,
            otpLength: 6,
        }),
    ],
    session: {
        expiresIn: oneDayInSeconds, // 1 days in sec
        updateAge: oneDayInSeconds, // 1 day in sec
        cookieCache: {
            enabled: true,
            maxAge: oneDayInSeconds, // 1 day in sec
        },
    },
});
