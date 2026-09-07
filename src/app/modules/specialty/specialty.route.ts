import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    createSpecialtySchema,
    updateSpecialtySchema,
} from "./specialty.validation";
import { multerUpload } from "../../../config/multer.config";

const router = Router();

router.post(
    "/",
    // checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(createSpecialtySchema),
    specialtyController.createSpecialty,
);
router.get("/", specialtyController.getAllSpecialty);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.getSpecialty,
);
router.patch(
    "/:id",
    validateRequest(updateSpecialtySchema),
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.updateSpecialty,
);
router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    specialtyController.deleteSpecialty,
);

export const specialitiesRoutes = router;
