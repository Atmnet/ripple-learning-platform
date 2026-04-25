import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createDocument,
  deleteDocument,
  downloadDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../modules/document/document.controller";

const router = Router();

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/download", authenticateToken, downloadDocument);

router.post("/", authenticateToken, requireAdmin, createDocument);
router.put("/:id", authenticateToken, requireAdmin, updateDocument);
router.delete("/:id", authenticateToken, requireAdmin, deleteDocument);

export default router;
