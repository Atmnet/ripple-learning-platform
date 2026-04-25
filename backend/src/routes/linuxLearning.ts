/**
 * Linux Learning Routes
 * Routes for Linux command learning, practice, quiz, and virtual terminal
 */

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getCategories,
  getCommandsByCategory,
  getCommandDetail,
  searchCommands,
  getScenarios,
  getScenarioDetail,
  getTaskDetail,
  initPractice,
  executePracticeCommand,
  validateTaskAnswer,
  nextTask,
  getPracticeStats,
  getQuizQuestions,
  submitQuizAnswer,
  getQuizStats,
  initTerminal,
  executeTerminalCommand,
  getTerminalInfo,
  resetTerminal,
  getAllStats,
} from "../modules/learning/learning.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ============ Category & Command Routes ============

// Get all categories
router.get("/categories", getCategories);

// Get commands by category
router.get("/commands/:category", getCommandsByCategory);

// Get command detail
router.get("/command/:name", getCommandDetail);

// Search commands
router.get("/search", searchCommands);

// ============ Practice Routes ============

// Get all scenarios
router.get("/scenarios", getScenarios);

// Get scenario detail
router.get("/scenario/:id", getScenarioDetail);

// Get task detail
router.get("/scenario/:id/task/:taskIndex", getTaskDetail);

// Initialize practice session
router.post("/practice/init", initPractice);

// Execute command in practice session
router.post("/practice/exec", executePracticeCommand);

// Validate task answer
router.post("/scenario/:id/task/:taskIndex/validate", validateTaskAnswer);

// Move to next task
router.post("/practice/next-task", nextTask);

// Get practice stats
router.get("/practice/stats", getPracticeStats);

// ============ Quiz Routes ============

// Get quiz questions
router.get("/quiz/questions", getQuizQuestions);

// Submit quiz answer
router.post("/quiz/answer", submitQuizAnswer);

// Get quiz stats
router.get("/quiz/stats", getQuizStats);

// ============ Virtual Terminal Routes ============

// Initialize terminal session
router.post("/terminal/init", initTerminal);

// Execute command in terminal
router.post("/terminal/exec", executeTerminalCommand);

// Get terminal session info
router.get("/terminal/:sessionId", getTerminalInfo);

// Reset terminal session
router.post("/terminal/:sessionId/reset", resetTerminal);

// ============ Stats Route ============

// Get all stats
router.get("/stats", getAllStats);

export default router;
