import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.createSpecialty,
);
router.get("/", specialtyController.getAllSpecialty);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.getSpecialty,
);
router.put(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.updateSpecialty,
);
router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.deleteSpecialty,
);

export const specialitiesRoutes = router;
