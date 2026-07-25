import { Router } from "express";
import { authController } from "./auth.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    forgetPasswordSchema,
    patientSchema,
    resetPasswordSchema,
} from "./auth.validation";

const router = Router();

router.post(
    "/register",
    validateRequest(patientSchema),
    authController.registerUser,
);
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
router.post("/verify-email", authController.verifyEmail);
router.post(
    "/forget-password",
    validateRequest(forgetPasswordSchema),
    authController.forgetPassword,
);
router.post(
    "/reset-password",
    validateRequest(resetPasswordSchema),
    authController.resetPassword,
);
router.get("/login/google", authController.loginWithGoogle);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/login/error", authController.handleOAuthError);

export const authRoutes = router;
