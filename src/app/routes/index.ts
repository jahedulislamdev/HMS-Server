import { Router } from "express";
import { specialitiesRoutes } from "../modules/specialty/specialty.route";

const router = Router();

router.use("/specialities", specialitiesRoutes);

export const indexRoutes = router;
