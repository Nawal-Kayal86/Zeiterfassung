import express from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import systemRoutes from "./systemRoutes.js";
import userRoutes from "./users.js";
import departmentRoutes from "./departments.js";
import reportRoutes from "./reportRoutes.js";
import workSessionRoutes from "./workSessions.js";
import calendarRoutes from "./calendar.js";
import scheduleRoutes from "./schedules.js";
import workflowRoutes from "./workflows.js";
import leaveRequestRoutes from "./leaveRequests.js";
import logRoutes from "./logs.js";
import { createDeprecatedAliasRouter } from "../utils/http.js";

const router = express.Router();

router.use(authRoutes);
router.use(systemRoutes);
router.use("/admin", adminRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/work-sessions", workSessionRoutes);
router.use("/workSessions", ...createDeprecatedAliasRouter("/api/work-sessions", workSessionRoutes));
router.use("/calendar", calendarRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/schedule", ...createDeprecatedAliasRouter("/api/schedules", scheduleRoutes));
router.use("/workflows", workflowRoutes);
router.use("/workflow", ...createDeprecatedAliasRouter("/api/workflows", workflowRoutes));
router.use("/leave-requests", leaveRequestRoutes);
router.use("/logs", logRoutes);

export default router;
