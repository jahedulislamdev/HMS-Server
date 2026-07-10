import { Router } from "express";
import { specialitiesRoutes } from "../modules/specialty/specialty.route";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { adminRoutes } from "../modules/admin/admin.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/specialities", specialitiesRoutes);
router.use("/admin", adminRoutes);

export const indexRoutes = router;
