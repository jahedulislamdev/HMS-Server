import { Router } from "express";

import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router = Router();
router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    adminController.getAdmins,
);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    adminController.getAdminById,
);
router.patch(
    "/:id",
    checkAuth(UserRole.SUPER_ADMIN),
    adminController.updateAdmin,
);
router.delete(
    "/:id",
    checkAuth(UserRole.SUPER_ADMIN),
    adminController.deleteAdmin,
);

export const adminRoutes = router;
