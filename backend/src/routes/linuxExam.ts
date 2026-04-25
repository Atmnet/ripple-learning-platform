import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createExamHandler,
  deleteExamHandler,
  endExamHandler,
  getAllExamsHandler,
  getExamDetailHandler,
  getExamResultDetailHandler,
  getExamResultsHandler,
  getPublishedExamsHandler,
  getQuestionBank,
  getStudentExamsHandler,
  publishExamHandler,
  startExamHandler,
  submitExamAnswerHandler,
  updateExamHandler,
} from "../modules/exam/exam.controller";

const router = Router();

// 教师端
router.get("/question-bank", authenticateToken, requireAdmin, getQuestionBank);
router.post("/exams", authenticateToken, requireAdmin, createExamHandler);
router.get("/exams", authenticateToken, requireAdmin, getAllExamsHandler);
router.get("/exams/:id/results", authenticateToken, requireAdmin, getExamResultsHandler);
router.post("/exams/:id/publish", authenticateToken, requireAdmin, publishExamHandler);
router.post("/exams/:id/end", authenticateToken, requireAdmin, endExamHandler);
router.put("/exams/:id", authenticateToken, requireAdmin, updateExamHandler);
router.delete("/exams/:id", authenticateToken, requireAdmin, deleteExamHandler);

// 学生端
router.get("/exams/published", authenticateToken, getPublishedExamsHandler);
router.post("/exams/:id/start", authenticateToken, startExamHandler);
router.get("/student-exams", authenticateToken, getStudentExamsHandler);
router.get("/student-exams/:id", authenticateToken, getExamResultDetailHandler);
router.post("/student-exams/:id/submit", authenticateToken, submitExamAnswerHandler);

// 通用详情放在静态路由后面，避免把 published 当成 id
router.get("/exams/:id", authenticateToken, getExamDetailHandler);

export default router;
