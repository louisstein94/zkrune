/**
 * Solana RPC endpoint resolution.
 *
 * Helius is the default provider: it is the only endpoint in the chain that
 * serves the enhanced APIs (DAS, priority fees) and that tolerates the call
 * volume proof verification generates. The public mainnet endpoint is a
 * last-resort fallback — it rate-limits aggressively and blocks several of
 * the methods the UI depends on.
 *
 * Two Helius conventions exist in this repo for historical reasons:
 * HELIUS_RPC_URL holds a full endpoint, while HELIUS_API_KEY holds just the
 * key (used by the snapshot scripts, the mobile app and the Telegram bot).
 * Accept both so that configuring either one is enough.
 */

export const MAINNET_PUBLIC_RPC = 'https://api.mainnet-beta.solana.com';

/** Full Helius endpoint, or null when no Helius credential is configured. */
export function getHeliusRpcUrl(): string | null {
  const explicit = process.env.HELIUS_RPC_URL?.trim();
  if (explicit) return explicit;

  const apiKey = process.env.HELIUS_API_KEY?.trim();
  if (apiKey) return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  return null;
}

/**
 * The endpoint every server-side Solana call should use.
 *
 * Order: Helius, then an explicitly configured RPC, then the public endpoint.
 * Always mainnet — these paths read mainnet state (token balances, verifier
 * program accounts), so falling back to devnet returns silently wrong data
 * rather than failing loudly.
 */
export function getSolanaRpcUrl(): string {
  return (
    getHeliusRpcUrl() ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
    MAINNET_PUBLIC_RPC
  );
}

/** True when a Helius credential is configured. */
export function isHeliusConfigured(): boolean {
  return getHeliusRpcUrl() !== null;
}
