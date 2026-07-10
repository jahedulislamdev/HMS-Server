import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { adminSchema, doctorSchema } from "./user.validation";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/create-doctor",
    validateRequest(doctorSchema),
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    userController.createDoctor,
);
router.post(
    "/create-admin",
    validateRequest(adminSchema),
    checkAuth(UserRole.SUPER_ADMIN),
    userController.createAdmin,
);

export const userRoutes = router;
