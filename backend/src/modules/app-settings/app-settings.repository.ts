import { AppError } from "../../app/errors/AppError";
import { ERROR_CODES } from "../../app/errors/error-codes";
import pool from "../../config/database";

export interface AppSettings {
  allowRegistration: boolean;
  dailyReportReminder: boolean;
  assignmentReminder: boolean;
  maxFileSize: number;
  bosEnabled: boolean;
  bosDomain: string;
  bosBucket: string;
  bosAccessKey: string;
  bosSecretKey: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  allowRegistration: false,
  dailyReportReminder: true,
  assignmentReminder: true,
  maxFileSize: 10,
  bosEnabled: false,
  bosDomain: "",
  bosBucket: "",
  bosAccessKey: "",
  bosSecretKey: "",
};

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "true";
}

function toNumber(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value: string | undefined, fallback: string) {
  return value === undefined ? fallback : value;
}

export class AppSettingsRepository {
  async getSettings(): Promise<AppSettings> {
    const keys = [
      "allowRegistration",
      "dailyReportReminder",
      "assignmentReminder",
      "maxFileSize",
      "bosEnabled",
      "bosDomain",
      "bosBucket",
      "bosAccessKey",
      "bosSecretKey",
    ];

    let rows: Array<{ setting_key: string; setting_value: string }> = [];
    try {
      const [result] = (await pool.query(
        `SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN (${keys.map(() => "?").join(", ")})`,
        keys
      )) as any[];
      rows = result || [];
    } catch (error: any) {
      const code = String(error?.code || "");
      if (code === "ER_NO_SUCH_TABLE" || code === "ER_BAD_FIELD_ERROR") {
        return { ...DEFAULT_SETTINGS };
      }
      throw error;
    }

    const map = new Map<string, string>();
    rows.forEach((row: { setting_key: string; setting_value: string }) => {
      map.set(row.setting_key, row.setting_value);
    });

    return {
      allowRegistration: toBoolean(map.get("allowRegistration"), DEFAULT_SETTINGS.allowRegistration),
      dailyReportReminder: toBoolean(map.get("dailyReportReminder"), DEFAULT_SETTINGS.dailyReportReminder),
      assignmentReminder: toBoolean(map.get("assignmentReminder"), DEFAULT_SETTINGS.assignmentReminder),
      maxFileSize: toNumber(map.get("maxFileSize"), DEFAULT_SETTINGS.maxFileSize),
      bosEnabled: toBoolean(map.get("bosEnabled"), DEFAULT_SETTINGS.bosEnabled),
      bosDomain: toStringValue(map.get("bosDomain"), DEFAULT_SETTINGS.bosDomain),
      bosBucket: toStringValue(map.get("bosBucket"), DEFAULT_SETTINGS.bosBucket),
      bosAccessKey: toStringValue(map.get("bosAccessKey"), DEFAULT_SETTINGS.bosAccessKey),
      bosSecretKey: toStringValue(map.get("bosSecretKey"), DEFAULT_SETTINGS.bosSecretKey),
    };
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const entries = Object.entries(settings).filter(([, value]) => value !== undefined);

    if (entries.length) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        for (const [key, value] of entries) {
          await connection.execute(
            `
              INSERT INTO app_settings (setting_key, setting_value)
              VALUES (?, ?)
              ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `,
            [key, String(value)]
          );
        }
        await connection.commit();
      } catch (error: any) {
        await connection.rollback();
        const code = String(error?.code || "");
        if (code === "ER_NO_SUCH_TABLE" || code === "ER_BAD_FIELD_ERROR") {
          throw new AppError("系统设置数据表缺失，请先执行数据库迁移", 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
        }
        throw error;
      } finally {
        connection.release();
      }
    }

    return this.getSettings();
  }
}

export const appSettingsRepository = new AppSettingsRepository();
