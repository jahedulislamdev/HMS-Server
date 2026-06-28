import { Router } from "express";
import { specialitiesRoutes } from "../modules/specialty/specialty.route";
import { authRoutes } from "../modules/auth/auth.route";

const router = Router();

router.use("/specialities", specialitiesRoutes);
router.use("/auth", authRoutes);

export const indexRoutes = router;
