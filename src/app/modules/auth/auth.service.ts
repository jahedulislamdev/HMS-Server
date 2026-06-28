import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}
const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
    });
    if (!data.user) {
        throw new Error("Failed to register patient");
    }

    // ToDo : create patient profile by using transection after signup comteated
    //  const patient = prisma.$transaction(async(tx)=> {
    //   await tx.patient
    //  })
    return data;
};
interface ILoginUserPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}
const loginPatient = async (payload: ILoginUserPayload) => {
    const data = await auth.api.signInEmail({
        body: {
            email: payload.email,
            password: payload.password,
            rememberMe: payload.rememberMe,
        },
    });
    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("user is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new Error("user is deleted");
    }
    return data;
};

export const authService = { registerPatient, loginPatient };
