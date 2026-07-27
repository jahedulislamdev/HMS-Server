import { JwtPayload } from "jsonwebtoken";

export default function jwtPayload({ data }: { data: JwtPayload }) {
    console.log(data);

    return {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        emailVerified: data.user.emailVerified,
        isDeleted: data.user.isDeleted,
        status: data.user.status,
    };
}
