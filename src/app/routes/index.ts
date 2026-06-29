import { Router } from "express";
import { specialitiesRoutes } from "../modules/specialty/specialty.route";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/specialities", specialitiesRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export const indexRoutes = router;
