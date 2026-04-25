export interface RateLimitConfig {
  windowMs: number
  max: number
  enabled: boolean
}

let rateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 1000,
  enabled: true,
}

export class RateLimitRepository {
  getConfig() {
    return rateLimitConfig
  }

  updateConfig(nextConfig: Partial<RateLimitConfig>) {
    rateLimitConfig = { ...rateLimitConfig, ...nextConfig }
    return rateLimitConfig
  }

  resetConfig() {
    rateLimitConfig = {
      windowMs: 60 * 1000,
      max: 1000,
      enabled: true,
    }
    return rateLimitConfig
  }
}
