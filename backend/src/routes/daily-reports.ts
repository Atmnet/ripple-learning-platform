import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  addComment,
  createDailyReport,
  deleteComment,
  deleteDailyReport,
  getAllUsersDailyStatus,
  getComments,
  getDailyReportById,
  getDailyReports,
  getTodayStatus,
  updateComment,
  updateDailyReport,
} from "../modules/daily-report/daily-report.controller";

const router = Router();

router.use(authenticateToken);

router.post("/", createDailyReport);
router.get("/", getDailyReports);
router.get("/today-status", getTodayStatus);
router.get("/admin/status", requireAdmin, getAllUsersDailyStatus);

router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);
router.put("/:id/comments/:commentId", updateComment);
router.delete("/comments/:commentId", deleteComment);

router.get("/:id", getDailyReportById);
router.put("/:id", updateDailyReport);
router.delete("/:id", deleteDailyReport);

export default router;
