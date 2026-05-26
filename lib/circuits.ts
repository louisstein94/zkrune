// Canonical list of production circuit IDs.
//
// This is the single source of truth for "which circuits zkRune ships
// to the hosted verifier". When you add a new circuit:
//   1. Add the slug here.
//   2. Update TRUSTED_CIRCUITS in app/api/verify-proof/route.ts.
//   3. Update CircuitName enum in public/openapi.yaml.
//   4. Publish the WASM/zkey/vkey under public/circuits/.
//
// Until these are unified behind a single import, this file is the
// authoritative one — other modules should drift toward it, not away.

export const CIRCUIT_IDS = [
  "age-verification",
  "balance-proof",
  "range-proof",
  "membership-proof",
  "hash-preimage",
  "private-voting",
  "quadratic-voting",
  "signature-verification",
  "anonymous-reputation",
  "credential-proof",
  "nft-ownership",
  "whale-holder",
  "token-swap",
  "patience-proof",
] as const;

export type CircuitId = (typeof CIRCUIT_IDS)[number];

export function isCircuitId(value: string): value is CircuitId {
  return (CIRCUIT_IDS as readonly string[]).includes(value);
}
