import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorSchema } from "./doctor.validation";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", checkAuth(UserRole.PATIENT), doctorController.getDoctors);
router.get("/:id", doctorController.getDoctorById);
router.put(
    "/:id",
    validateRequest(updateDoctorSchema),
    doctorController.updateDoctor,
);
router.delete("/:id", doctorController.deleteDoctor);

export const doctorRoutes = router;
