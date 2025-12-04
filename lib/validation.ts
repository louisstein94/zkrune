/**
 * Input validation schemas using Zod
 * Protects against injection attacks and ensures data integrity
 */

import { z } from 'zod';

// Proof verification schema
export const proofVerificationSchema = z.object({
  proof: z.object({
    pi_a: z.array(z.string()).length(3),
    pi_b: z.array(z.array(z.string()).length(2)).length(3),
    pi_c: z.array(z.string()).length(3),
    protocol: z.string().optional(),
    curve: z.string().optional(),
  }),
  publicSignals: z.array(z.string()),
  vKey: z.object({
    protocol: z.string(),
    curve: z.string(),
    nPublic: z.number().int().positive(),
    vk_alpha_1: z.array(z.string()),
    vk_beta_2: z.array(z.array(z.string())),
    vk_gamma_2: z.array(z.array(z.string())),
    vk_delta_2: z.array(z.array(z.string())),
    vk_alphabeta_12: z.array(z.any()),
    IC: z.array(z.array(z.string())),
  }),
});

// Zcash balance query schema
export const zcashBalanceSchema = z.object({
  address: z.string().regex(/^[tz][a-zA-Z0-9]{33,}$/, 'Invalid Zcash address format'),
  viewingKey: z.string().optional(),
});

// Template ID validation
export const templateIdSchema = z.enum([
  'age-verification',
  'balance-proof',
  'membership-proof',
  'range-proof',
  'private-voting',
  'hash-preimage',
  'credential-proof',
  'token-swap',
  'signature-verification',
  'patience-proof',
  'quadratic-voting',
  'nft-ownership',
  'anonymous-reputation',
]);

// Proof input validation (generic)
export const proofInputSchema = z.record(
  z.string(), 
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ])
);

// Environment variables validation
export const envSchema = z.object({
  // Public
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONTRACT_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_LIGHTWALLETD_URL: z.string().url().optional(),
  NEXT_PUBLIC_ANALYTICS_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_ENABLE_TELEMETRY: z.enum(['true', 'false']).optional(),
  
  // Private (server-side only)
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

// Sanitize string input (prevent XSS)
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize object
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}`,
      };
    }
    return {
      success: false,
      error: 'Invalid input data',
    };
  }
}

// Safe JSON parse
export function safeJsonParse<T = any>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Check for common injection patterns
export function containsMaliciousPattern(input: string): boolean {
  const patterns = [
    /(<script|<iframe|<object|<embed)/i,
    /(javascript:|data:text\/html)/i,
    /(onerror|onload|onclick)=/i,
    /\.\.\//g, // Path traversal
    /(union|select|insert|update|delete|drop)\s+/i, // SQL injection (paranoid check)
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

// Rate limit key generator
export function generateRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}

// Validate circuit inputs
export function validateCircuitInputs(
  templateId: string,
  inputs: Record<string, any>
): { valid: boolean; error?: string } {
  // Validate template ID
  const templateResult = templateIdSchema.safeParse(templateId);
  if (!templateResult.success) {
    return { valid: false, error: 'Invalid template ID' };
  }
  
  // Validate inputs structure
  const inputsResult = proofInputSchema.safeParse(inputs);
  if (!inputsResult.success) {
    return { valid: false, error: 'Invalid input format' };
  }
  
  // Check for malicious patterns in string inputs
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string' && containsMaliciousPattern(value)) {
      return { valid: false, error: `Potentially malicious input detected in ${key}` };
    }
  }
  
  return { valid: true };
}

