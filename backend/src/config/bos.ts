import dotenv from "dotenv";
import { appSettingsRepository } from "../modules/app-settings/app-settings.repository";

dotenv.config();

interface BosClient {
  putObject(bucket: string, key: string, data: Buffer, options?: Record<string, unknown>): Promise<unknown>;
  deleteObject(bucket: string, key: string): Promise<unknown>;
}

interface BosRuntimeConfig {
  enabled: boolean;
  endpoint: string;
  host: string;
  bucket: string;
  credentials: {
    ak: string;
    sk: string;
  };
}

let BosClientClass: any = null;
try {
  const bos = require("@baiducloud/sdk");
  BosClientClass = bos.BosClient;
} catch {
  console.log("@baiducloud/sdk not installed, BOS features disabled");
}

let cachedKey = "";
let cachedAt = 0;
let cachedConfig: BosRuntimeConfig | null = null;
let cachedClient: BosClient | null = null;

function normalizeHost(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function buildEndpoint(host: string): string {
  if (!host) return "";
  return `https://${host}`;
}

export async function getBosRuntime(): Promise<{ config: BosRuntimeConfig; client: BosClient | null }> {
  const settings = await appSettingsRepository.getSettings();
  const host = normalizeHost(settings.bosDomain || process.env.BOS_HOST || "");
  const bucket = (settings.bosBucket || process.env.BOS_BUCKET || "").trim();
  const ak = (settings.bosAccessKey || process.env.BOS_ACCESS_KEY || "").trim();
  const sk = (settings.bosSecretKey || process.env.BOS_SECRET_KEY || "").trim();
  const endpoint = buildEndpoint(host);
  const enabled = Boolean(BosClientClass) && Boolean(settings.bosEnabled) && Boolean(host) && Boolean(bucket) && Boolean(ak) && Boolean(sk);

  const nextKey = JSON.stringify({
    enabled,
    endpoint,
    host,
    bucket,
    ak,
    sk,
  });

  if (cachedConfig && cachedKey === nextKey && Date.now() - cachedAt < 60_000) {
    return { config: cachedConfig, client: cachedClient };
  }

  const config: BosRuntimeConfig = {
    enabled,
    endpoint,
    host,
    bucket,
    credentials: { ak, sk },
  };

  let client: BosClient | null = null;
  if (config.enabled && BosClientClass) {
    try {
      client = new BosClientClass({
        endpoint: config.endpoint,
        credentials: config.credentials,
      });
    } catch (error) {
      console.error("BOS client init failed:", error);
      client = null;
      config.enabled = false;
    }
  }

  cachedKey = nextKey;
  cachedAt = Date.now();
  cachedConfig = config;
  cachedClient = client;

  return { config, client };
}
