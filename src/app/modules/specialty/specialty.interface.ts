export interface ISpecialtyCreatePayload {
    title: string;
    description?: string;
    icon?: string;
}
export interface ISpecialtyUpdatePayload {
    title?: string;
    description?: string;
    icon?: string;
}
