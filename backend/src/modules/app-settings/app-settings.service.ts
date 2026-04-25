import { AppError } from "../../app/errors/AppError";
import { ERROR_CODES } from "../../app/errors/error-codes";
import { appSettingsRepository, type AppSettings } from "./app-settings.repository";

function normalizeDomain(value: string | undefined): string {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

export class AppSettingsService {
  async getSettings() {
    return appSettingsRepository.getSettings();
  }

  async getPublicSettings() {
    const settings = await appSettingsRepository.getSettings();
    return {
      allowRegistration: settings.allowRegistration,
    };
  }

  async updateSettings(settings: Partial<AppSettings>) {
    if (settings.maxFileSize !== undefined && (settings.maxFileSize < 1 || settings.maxFileSize > 100)) {
      throw new AppError("文件上传限制必须在 1 到 100 MB 之间", 400, ERROR_CODES.BAD_REQUEST);
    }

    const normalizedSettings: Partial<AppSettings> = {
      ...settings,
    };

    if (settings.bosDomain !== undefined) {
      normalizedSettings.bosDomain = normalizeDomain(settings.bosDomain);
    }

    if (settings.bosBucket !== undefined) {
      normalizedSettings.bosBucket = String(settings.bosBucket || "").trim();
    }

    if (settings.bosAccessKey !== undefined) {
      normalizedSettings.bosAccessKey = String(settings.bosAccessKey || "").trim();
    }

    if (settings.bosSecretKey !== undefined) {
      normalizedSettings.bosSecretKey = String(settings.bosSecretKey || "").trim();
    }

    const nextBosEnabled = normalizedSettings.bosEnabled ?? settings.bosEnabled;
    if (nextBosEnabled) {
      const domain = normalizedSettings.bosDomain ?? "";
      const bucket = normalizedSettings.bosBucket ?? "";
      const ak = normalizedSettings.bosAccessKey ?? "";
      const sk = normalizedSettings.bosSecretKey ?? "";

      if (!domain || !bucket || !ak || !sk) {
        throw new AppError("启用百度 BOS 前，请完整填写域名、Bucket、AK 和 SK", 400, ERROR_CODES.BAD_REQUEST);
      }
    }

    return appSettingsRepository.updateSettings(normalizedSettings);
  }
}

export const appSettingsService = new AppSettingsService();
