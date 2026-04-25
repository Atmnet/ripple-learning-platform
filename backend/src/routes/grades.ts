import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { exportGrades, getAllGrades, importGrades } from "../modules/grades/grades.controller";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/", getAllGrades);
router.get("/export", exportGrades);
router.post("/import", importGrades);

export default router;
