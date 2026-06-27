import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post("/", specialtyController.createSpecialty);
router.get("/", specialtyController.getAllSpecialty);
router.get("/:id", specialtyController.getSpecialty);
router.put("/:id", specialtyController.updateSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);

export const specialitiesRoutes = router;
