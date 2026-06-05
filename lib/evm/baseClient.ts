/**
 * Shared Base (L2) public client for browser-side on-chain verification.
 *
 * The default viem `http()` transport falls back to https://mainnet.base.org,
 * which is heavily rate-limited and intermittently returns 429s — surfacing in
 * the UI as viem's opaque "HTTP request failed". To keep the live demos
 * reliable we use a `fallback` transport across several CORS-enabled public
 * endpoints, with an optional private RPC via NEXT_PUBLIC_BASE_RPC_URL taking
 * priority.
 */
import { createPublicClient, fallback, http } from "viem";
import { base } from "viem/chains";

// CORS-enabled public Base endpoints, ordered by observed reliability.
const PUBLIC_BASE_RPCS = [
  "https://base-rpc.publicnode.com",
  "https://base.drpc.org",
  "https://mainnet.base.org",
];

const configuredRpc = process.env.NEXT_PUBLIC_BASE_RPC_URL;

const rpcUrls = configuredRpc
  ? [configuredRpc, ...PUBLIC_BASE_RPCS]
  : PUBLIC_BASE_RPCS;

export const baseClient = createPublicClient({
  chain: base,
  transport: fallback(
    rpcUrls.map((url) => http(url, { timeout: 12_000 })),
    { rank: false },
  ),
});
