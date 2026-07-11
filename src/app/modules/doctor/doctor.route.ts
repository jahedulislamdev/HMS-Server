import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorSchema } from "./doctor.validation";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", doctorController.getDoctors);
router.get("/:id", doctorController.getDoctorById);
router.patch(
    "/:id",
    validateRequest(updateDoctorSchema),
    checkAuth(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.ADMIN),
    doctorController.updateDoctor,
);
router.delete(
    "/:id",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.ADMIN),
    doctorController.deleteDoctor,
);

export const doctorRoutes = router;
