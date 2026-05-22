/**
 * Raw on-chain proof verification.
 *
 * verifyZkRuneProof decodes the `X-zkRune-Proof` envelope and runs it through
 * the zkRune verifier contract on Base via a `verifyProofStatic` view call.
 * No wallet, no gas, ~50ms over a warm RPC connection.
 *
 * It never throws on a bad proof — a malformed or rejected proof comes back
 * as `{ valid: false, reason }`. It throws only on misconfiguration.
 */

import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import {
  BASE_VERIFIER_ADDRESS,
  DEFAULT_BASE_RPC,
  TEMPLATE_IDS,
  isKnownCircuit,
} from "./chains.js";
import type { Groth16Proof, VerifyResult, ZkRuneProofEnvelope } from "./types.js";

const ABI = parseAbi([
  "function verifyProofStatic(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) view returns (bool)",
]);

export interface VerifyOptions {
  /** Base RPC URL. Defaults to the public endpoint — set your own in prod. */
  rpcUrl?: string;
  /** Verifier contract address. Defaults to the Base mainnet deployment. */
  verifierAddress?: `0x${string}`;
}

function makeClient(rpcUrl: string) {
  return createPublicClient({ chain: base, transport: http(rpcUrl) });
}

/** One client per RPC URL — the view call is cheap, the connection is not. */
type RpcClient = ReturnType<typeof makeClient>;
const clientCache = new Map<string, RpcClient>();

function getClient(rpcUrl: string): RpcClient {
  let client = clientCache.get(rpcUrl);
  if (!client) {
    client = makeClient(rpcUrl);
    clientCache.set(rpcUrl, client);
  }
  return client;
}

/** Decode base64(JSON) into a proof envelope. Returns null if malformed. */
export function decodeProofHeader(
  header: string
): ZkRuneProofEnvelope | null {
  try {
    const json = Buffer.from(header, "base64").toString("utf8");
    const parsed = JSON.parse(json) as ZkRuneProofEnvelope;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.proof ||
      !Array.isArray(parsed.publicSignals)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * snarkjs emits pi_b coordinates in the order the verifier contract does NOT
 * expect — the inner pairs must be swapped. This mirrors the transform used
 * by the zkRune web verifier.
 */
function toContractArgs(proof: Groth16Proof) {
  const a: readonly [bigint, bigint] = [
    BigInt(proof.pi_a[0]),
    BigInt(proof.pi_a[1]),
  ];
  const b: readonly [
    readonly [bigint, bigint],
    readonly [bigint, bigint]
  ] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const c: readonly [bigint, bigint] = [
    BigInt(proof.pi_c[0]),
    BigInt(proof.pi_c[1]),
  ];
  return { a, b, c };
}

/**
 * Verify a decoded proof envelope against the Base verifier.
 *
 * @param circuit  expected circuit name (e.g. "age-verification")
 * @param envelope decoded `X-zkRune-Proof` payload
 */
export async function verifyZkRuneProof(
  circuit: string,
  envelope: ZkRuneProofEnvelope,
  options: VerifyOptions = {}
): Promise<VerifyResult> {
  if (!isKnownCircuit(circuit)) {
    return { valid: false, reason: "unknown_circuit", circuit };
  }

  const templateId = TEMPLATE_IDS[circuit];
  const rpcUrl = options.rpcUrl ?? DEFAULT_BASE_RPC;
  const verifierAddress = options.verifierAddress ?? BASE_VERIFIER_ADDRESS;

  let args: ReturnType<typeof toContractArgs>;
  let publicInputs: bigint[];
  try {
    args = toContractArgs(envelope.proof);
    publicInputs = envelope.publicSignals.map((s) => BigInt(s));
  } catch {
    return { valid: false, reason: "malformed_proof", circuit };
  }

  try {
    const ok = await getClient(rpcUrl).readContract({
      address: verifierAddress,
      abi: ABI,
      functionName: "verifyProofStatic",
      args: [templateId, args.a, args.b, args.c, publicInputs],
    });
    return ok
      ? { valid: true, circuit, publicSignals: envelope.publicSignals }
      : {
          valid: false,
          reason: "proof_rejected",
          circuit,
          publicSignals: envelope.publicSignals,
        };
  } catch (err) {
    return {
      valid: false,
      reason: "verifier_error",
      circuit,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
