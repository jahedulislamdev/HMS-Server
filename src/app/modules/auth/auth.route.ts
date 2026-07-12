import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.registerPatient);
router.post("/login", authController.loginPatient);
router.get("/get-token", authController.getNewToken);

export const authRoutes = router;
