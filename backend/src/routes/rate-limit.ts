import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  getRateLimitConfig,
  resetRateLimitConfig,
  updateRateLimitConfig,
} from "../modules/rate-limit/rate-limit.controller";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/", getRateLimitConfig);
router.put("/", updateRateLimitConfig);
router.post("/reset", resetRateLimitConfig);

export default router;
