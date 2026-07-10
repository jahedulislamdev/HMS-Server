import { Router } from "express";
import { adminController } from "./admin.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { IUpdateAdminPayloadSchema } from "./admin.validation";

const router = Router();
router.get(
    "/",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    adminController.getAdmins,
);
router.get(
    "/:id",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    adminController.getAdminById,
);
router.patch(
    "/",
    validateRequest(IUpdateAdminPayloadSchema),
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    adminController.updateAdmin,
);
router.delete(
    "/",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    adminController.deleteAdmin,
);

export const adminRoutes = router;
