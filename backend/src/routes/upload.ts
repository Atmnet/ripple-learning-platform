import fs from "fs";
import multer from "multer";
import path from "path";
import { Router } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import { deleteFile, uploadFile } from "../utils/bosUploader";

const router = Router();
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    console.log("Upload file originalName:", file.originalname, "->", originalName);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, _file, cb) => {
    cb(null, true);
  },
});

router.post("/", authenticateToken, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const localFilePath = req.file.path;
    const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

    console.log("文件上传请求:", { localFilePath, originalName, user: req.user?.id });

    const fileUrl = await uploadFile(localFilePath, originalName);

    console.log("文件上传结果:", { fileUrl });

    if (fileUrl.startsWith("http")) {
      fs.unlink(localFilePath, (error) => {
        if (error) console.error("Failed to delete local temp file:", error);
      });
    }

    return res.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: originalName,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/multiple", authenticateToken, upload.array("files", 10), async (req: AuthRequest, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles: Array<{ url: string; filename: string; size: number }> = [];

    for (const file of files) {
      const localFilePath = file.path;
      const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");

      console.log("多文件上传请求:", { localFilePath, originalName, user: req.user?.id });

      const fileUrl = await uploadFile(localFilePath, originalName);

      console.log("文件上传结果:", { fileUrl });

      if (fileUrl.startsWith("http")) {
        fs.unlink(localFilePath, (error) => {
          if (error) console.error("Failed to delete local temp file:", error);
        });
      }

      uploadedFiles.push({
        url: fileUrl,
        filename: originalName,
        size: file.size,
      });
    }

    return res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Multi-upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

router.delete("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    console.log("删除文件请求:", { fileUrl, user: req.user?.id });

    await deleteFile(fileUrl);

    return res.json({
      message: "File deleted successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
