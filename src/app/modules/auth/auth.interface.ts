export interface ILoginUserPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}
export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}
export interface ISession {
    session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null;
        userAgent?: string | null;
    };
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null;
        role: string;
        status: string;
        isDeleted: boolean;
        needPasswordChange: boolean;
        deletedAt?: Date | null;
    };
}

export type SessionResponse = ISession | null;
