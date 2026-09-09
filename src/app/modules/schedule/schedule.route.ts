import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "./../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();
router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest(ScheduleValidation.createScheduleSchema),
    scheduleController.createSchedule,
);
router.get("/", scheduleController.getAllSchedules);
router.get("/:id", scheduleController.getSchedule);
router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest(ScheduleValidation.updateScheduleSchema),
    scheduleController.updateSchedules,
);
router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    scheduleController.deleteSchedules,
);
export const scheduleRoutes = router;
