import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { doctorSchema } from "./user.validation";

const router = Router();

router.post(
    "/create-doctor",
    validateRequest(doctorSchema),
    userController.createDoctor,
);
// router.post("/create-admin", userController.createDoctor);
// router.post("/create-superadmin", userController.createDoctor);

export const userRoutes = router;
