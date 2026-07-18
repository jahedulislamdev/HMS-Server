import { Router } from "express";
import { authController } from "./auth.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.getNewToken);
router.post(
    "/change-password",
    checkAuth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.SUPER_ADMIN,
        UserRole.PATIENT,
    ),
    authController.changePassword,
);
router.post(
    "/logout",
    checkAuth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.SUPER_ADMIN,
        UserRole.PATIENT,
    ),
    authController.logoutUser,
);
router.post(
    "/logout-all",
    checkAuth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.SUPER_ADMIN,
        UserRole.PATIENT,
    ),
    authController.logoutAll,
);

export const authRoutes = router;
