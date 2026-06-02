/**
 * Client wrapper around the bot's HTTP registry endpoints.
 *
 * The bot exposes:
 *   GET  /registration-message?x=…&y=…   → canonical message bytes to sign
 *   POST /register                       → submit Solana-signed binding
 *   GET  /registration/:solanaAddress    → look up existing binding
 *
 * The base URL defaults to the bot's public Railway URL but can be overridden
 * via NEXT_PUBLIC_BOT_API_URL for local testing.
 */

const BASE = (process.env.NEXT_PUBLIC_BOT_API_URL || "https://rpd-whale-bot-production.up.railway.app").replace(/\/$/, "");

export interface RegistrationStatus {
  registered: boolean;
  bjjPubkeyX?: string;
  bjjPubkeyY?: string;
  registeredAt?: number;
}

export async function fetchRegistrationStatus(
  solanaAddress: string,
): Promise<RegistrationStatus> {
  const res = await fetch(
    `${BASE}/registration/${encodeURIComponent(solanaAddress)}`,
    { cache: "no-store" },
  );
  if (res.status === 404) return { registered: false };
  if (!res.ok) throw new Error(`Registry lookup failed: ${res.status}`);
  return (await res.json()) as RegistrationStatus;
}

export async function fetchRegistrationMessage(
  bjjPubkeyX: string,
  bjjPubkeyY: string,
): Promise<string> {
  const url = `${BASE}/registration-message?x=${bjjPubkeyX}&y=${bjjPubkeyY}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not fetch registration message: ${res.status}`);
  const body = (await res.json()) as { message: string };
  return body.message;
}

export async function submitRegistration(input: {
  solanaAddress: string;
  bjjPubkeyX: string;
  bjjPubkeyY: string;
  signature: string;
}): Promise<{ registered: true } | { error: string }> {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: (body as any).error || `HTTP ${res.status}` };
  return body as { registered: true };
}
