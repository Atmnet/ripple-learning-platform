import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { downloadSubmission, getMySubmissions } from "../modules/assignment/assignment.controller";

const router = Router();

router.get("/my", authenticateToken, getMySubmissions);
router.get("/:submissionId/download", authenticateToken, downloadSubmission);

export default router;
