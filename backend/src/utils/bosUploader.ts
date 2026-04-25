import * as fs from "fs";
import * as path from "path";
import { getBosRuntime } from "../config/bos";

export async function uploadFile(localFilePath: string, originalName: string): Promise<string> {
  const { config, client } = await getBosRuntime();

  console.log("uploadFile called:", {
    localFilePath,
    originalName,
    enabled: config.enabled,
    hasClient: !!client,
  });

  if (!config.enabled || !client) {
    const localUrl = `/uploads/${path.basename(localFilePath)}`;
    console.log("Using local storage:", localUrl);
    return localUrl;
  }

  try {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(originalName);
    const key = `documents/${timestamp}-${random}${ext}`;

    const stats = fs.statSync(localFilePath);
    const fileSize = stats.size;
    console.log(`Uploading file ${originalName}, size ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

    const fileContent = await fs.promises.readFile(localFilePath);

    await client.putObject(config.bucket, key, fileContent, {
      "Content-Type": getContentType(ext),
    });

    const protocol = config.endpoint.startsWith("https") ? "https" : "http";
    const fileUrl = `${protocol}://${config.bucket}.${config.host}/${key}`;
    console.log("BOS upload success:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("BOS upload error:", error);
    const fallbackUrl = `/uploads/${path.basename(localFilePath)}`;
    console.log("Falling back to local storage:", fallbackUrl);
    return fallbackUrl;
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const { config, client } = await getBosRuntime();

  if (!config.enabled || !client) {
    const localPath = path.join(__dirname, "../../", fileUrl.replace("/uploads/", "uploads/"));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return;
  }

  try {
    const key = extractKeyFromUrl(fileUrl);
    if (key) {
      await client.deleteObject(config.bucket, key);
    }
  } catch (error) {
    console.error("BOS delete error:", error);
  }
}

function getContentType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}

function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    console.error("Invalid URL:", url);
    return null;
  }
}
