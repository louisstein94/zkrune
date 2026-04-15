/**
 * Environment variables validation and type-safe access
 *
 * Validates env vars at module load. Missing or malformed values throw in
 * every environment (production, development, test) so misconfiguration
 * surfaces immediately instead of at first runtime call.
 */

import { envSchema } from './validation';

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
    // Fail closed in every environment (previously only production threw
    // and dev silently returned the raw unvalidated object). Swallowing
    // malformed env values hides real misconfiguration and lets tests
    // pass against accidentally-wrong NODE_ENV / analytics flags.
    const formatted = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`Invalid environment variables configuration:\n${formatted}`);
  }

  return result.data;
}

// Export validated environment. Any error thrown here will crash module
// load and surface at the first import — this is intentional.
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
