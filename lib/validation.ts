/**
 * Input validation schemas using Zod
 * Protects against injection attacks and ensures data integrity
 */

import { z } from 'zod';

// A numeric field element expressed as a decimal string — snarkjs proof fields
// are decimal strings of 256-bit integers. We bound the length to prevent
// pathologically large payloads and reject non-digit content.
const fieldElementString = z
  .string()
  .min(1)
  .max(80)
  .regex(/^-?\d+$/, 'Field element must be a decimal string');

// Proof verification schema.
// Every array is length-bounded so a single request cannot force the server
// to parse megabytes of fake field elements.
export const proofVerificationSchema = z.object({
  proof: z.object({
    pi_a: z.array(fieldElementString).length(3),
    pi_b: z.array(z.array(fieldElementString).length(2)).length(3),
    pi_c: z.array(fieldElementString).length(3),
    protocol: z.string().max(32).optional(),
    curve: z.string().max(32).optional(),
  }),
  // nPublic is bounded at 32 by the snarkjs + groth16-solana pipeline in
  // practice; give a generous 64 to absorb future circuits.
  publicSignals: z.array(fieldElementString).max(64),
  vKey: z.object({
    protocol: z.literal('groth16'),
    curve: z.literal('bn128'),
    nPublic: z.number().int().positive().max(64),
    vk_alpha_1: z.array(fieldElementString).length(3),
    vk_beta_2: z.array(z.array(fieldElementString).length(2)).length(3),
    vk_gamma_2: z.array(z.array(fieldElementString).length(2)).length(3),
    vk_delta_2: z.array(z.array(fieldElementString).length(2)).length(3),
    // alphabeta_12 is an Fp12 element: 2x3x2 nested array of field elements.
    // Enforce the shape instead of allowing z.any() so a malicious request
    // cannot smuggle in arbitrary nested objects.
    vk_alphabeta_12: z
      .array(z.array(z.array(fieldElementString).length(2)).length(3))
      .length(2),
    IC: z.array(z.array(fieldElementString).length(3)).max(65),
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

// Coarse screen for clearly dangerous substrings in circuit inputs.
// NOTE: this is NOT a sanitization primitive — inputs are never rendered
// as HTML anywhere. We only use it as a defensive filter for the proof
// input path where values must be numeric strings or booleans. The
// "SQL-keyword" paranoid check was removed because it produced false
// positives on benign words like "select" / "delete".
export function containsMaliciousPattern(input: string): boolean {
  const patterns = [
    /<\s*(script|iframe|object|embed)\b/i,
    /(javascript|data):/i,
    /on\w+\s*=/i,
    // Path traversal covering ./, ..\, and URL-encoded variants.
    /\.\.[/\\]/,
    /%2e%2e[/\\]/i,
  ];
  return patterns.some((pattern) => pattern.test(input));
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

