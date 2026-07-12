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
