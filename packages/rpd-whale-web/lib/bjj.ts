/**
 * BabyJubjub keypair utilities shared by the registration page and the Mini App.
 *
 * The user's BJJ secret key is the ONLY long-lived identity material in the v2
 * flow. It is generated once during registration on the public-web `/register`
 * page (with a Solana wallet binding the BJJ pubkey via an Ed25519 signature),
 * then imported into the Telegram Mini App via QR code so the Mini App can
 * locally generate proofs without ever seeing the Solana address.
 *
 * Storage:
 *   - localStorage key: `rpd-bjj-sk`  → 64-char hex string
 *   - QR payload prefix: `zkrune-bjj:v1:`  followed by the 64-char hex secret
 */

import { buildBabyjub } from "circomlibjs";

let bjjCache: Awaited<ReturnType<typeof buildBabyjub>> | null = null;

async function getBjj() {
  if (!bjjCache) bjjCache = await buildBabyjub();
  return bjjCache;
}

const SK_BYTES = 31; // 248 bits — safely below the BN254 / BJJ subgroup
const LS_KEY = "rpd-bjj-sk";
const QR_PREFIX = "zkrune-bjj:v1:";

// ── Secret generation & serialization ────────────────────────────────────────

export function generateBjjSecret(): bigint {
  const bytes = new Uint8Array(SK_BYTES);
  crypto.getRandomValues(bytes);
  let val = 0n;
  for (const b of bytes) val = (val << 8n) | BigInt(b);
  return val;
}

export function bjjSecretToHex(sk: bigint): string {
  return sk.toString(16).padStart(SK_BYTES * 2, "0");
}

export function bjjSecretFromHex(hex: string): bigint {
  const clean = hex.replace(/^0x/, "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean)) {
    throw new Error("BJJ secret must be hex");
  }
  return BigInt("0x" + clean);
}

// ── Pubkey derivation ────────────────────────────────────────────────────────

export interface BjjPubkey {
  x: bigint;
  y: bigint;
}

export async function deriveBjjPubkey(sk: bigint): Promise<BjjPubkey> {
  const jub = await getBjj();
  const [Ax, Ay] = jub.mulPointEscalar(jub.Base8, sk);
  return {
    x: jub.F.toObject(Ax) as bigint,
    y: jub.F.toObject(Ay) as bigint,
  };
}

// ── localStorage persistence ─────────────────────────────────────────────────

export function loadBjjSecretLocal(): bigint | null {
  if (typeof window === "undefined") return null;
  const hex = window.localStorage.getItem(LS_KEY);
  if (!hex) return null;
  try {
    return bjjSecretFromHex(hex);
  } catch {
    return null;
  }
}

export function saveBjjSecretLocal(sk: bigint): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, bjjSecretToHex(sk));
}

export function clearBjjSecretLocal(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_KEY);
}

// ── QR encoding ──────────────────────────────────────────────────────────────

export function encodeBjjSecretQr(sk: bigint): string {
  return QR_PREFIX + bjjSecretToHex(sk);
}

export function decodeBjjSecretQr(payload: string): bigint | null {
  const trimmed = payload.trim();
  if (!trimmed.startsWith(QR_PREFIX)) return null;
  try {
    return bjjSecretFromHex(trimmed.slice(QR_PREFIX.length));
  } catch {
    return null;
  }
}
