import { JwtPayload } from "jsonwebtoken";

export default function jwtPayload({ data }: { data: JwtPayload }) {
    return {
        id: data.id,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified,
        isDeleted: data.isDeleted,
        status: data.status,
    };
}
