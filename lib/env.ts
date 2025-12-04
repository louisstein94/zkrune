/**
 * Environment variables validation and type-safe access
 */

import { envSchema } from './validation';

// Validate environment variables on startup
function validateEnv() {
  const env = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_LIGHTWALLETD_URL: process.env.NEXT_PUBLIC_LIGHTWALLETD_URL,
    NEXT_PUBLIC_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_TELEMETRY: process.env.NEXT_PUBLIC_ENABLE_TELEMETRY,
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = envSchema.safeParse(env);
  
  if (!result.success) {
    console.warn('[ENV] Environment validation warnings:', result.error.format());
    // Don't fail in development, just warn
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables configuration');
    }
  }
  
  return result.success ? result.data : env;
}

// Export validated environment
export const env = validateEnv();

// Type-safe environment access
export function getEnv<K extends keyof typeof env>(key: K): typeof env[K] {
  return env[key];
}

// Check if running in production
export const isProduction = env.NODE_ENV === 'production';

// Check if analytics enabled
export const isAnalyticsEnabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

// Check if telemetry enabled
export const isTelemetryEnabled = env.NEXT_PUBLIC_ENABLE_TELEMETRY === 'true';

