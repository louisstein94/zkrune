// Client-Side ZK Proof Generation (Browser-based, no server!)

import { poseidon1, poseidon2 } from 'poseidon-lite';
import { MembershipRegistry } from '@/packages/zkrune-sdk/src/membership/registry';

const CIRCUIT_V = process.env.NEXT_PUBLIC_CIRCUIT_V || '';

function circuitUrl(file: string): string {
  return `/circuits/${file}${CIRCUIT_V ? `?v=${CIRCUIT_V}` : ''}`;
}

const DEMO_MEMBERS = ['alice', 'bob', 'charlie', 'diana', 'eve'];

function stringToBigInt(s: string): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(s);
  let val = BigInt(0);
  const limit = Math.min(bytes.length, 31);
  for (let i = 0; i < limit; i++) {
    val = (val << BigInt(8)) | BigInt(bytes[i]);
  }
  return val || BigInt(1);
}

function computeHash(a: string, b: string): string {
  return poseidon2([BigInt(a), BigInt(b)]).toString();
}

// A15: per-process cache for verification keys. First successful fetch is
// retained, so a later MITM cannot swap in a different VK mid-session.
const vkeyCache = new Map<string, unknown>();

/**
 * Verifies that a fetched vKey has the expected Groth16 structure before
 * handing it to snarkjs. A structurally invalid VK is rejected up front
 * instead of being passed to snarkjs, which may silently accept a
 * malformed-but-valid-for-bogus-proof object in corner cases.
 */
function assertValidVkey(vkey: unknown): asserts vkey is Record<string, unknown> {
  if (!vkey || typeof vkey !== 'object') {
    throw new Error('Verification key is not an object');
  }
  const vk = vkey as Record<string, unknown>;
  if (vk.protocol !== 'groth16') {
    throw new Error(`Unexpected VK protocol: ${String(vk.protocol)}`);
  }
  if (vk.curve !== 'bn128') {
    throw new Error(`Unexpected VK curve: ${String(vk.curve)}`);
  }
  if (typeof vk.nPublic !== 'number' || vk.nPublic < 1) {
    throw new Error('VK nPublic is missing or invalid');
  }
  if (!Array.isArray(vk.IC) || vk.IC.length !== (vk.nPublic as number) + 1) {
    throw new Error('VK IC length does not match nPublic + 1');
  }
  for (const field of ['vk_alpha_1', 'vk_beta_2', 'vk_gamma_2', 'vk_delta_2']) {
    if (!Array.isArray(vk[field])) {
      throw new Error(`VK is missing required field: ${field}`);
    }
  }
}

async function loadVkey(templateId: string): Promise<unknown> {
  const cached = vkeyCache.get(templateId);
  if (cached) return cached;

  const url = circuitUrl(`${templateId}_vkey.json`);
  const vkeyResponse = await fetch(url);
  if (!vkeyResponse.ok) {
    throw new Error(`Failed to fetch verification key (${vkeyResponse.status})`);
  }

  const contentType = vkeyResponse.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected VK content-type: ${contentType}`);
  }

  const vKey = await vkeyResponse.json();
  assertValidVkey(vKey);
  vkeyCache.set(templateId, vKey);
  return vKey;
}

function prepareCircuitInputs(templateId: string, params: Record<string, any>): Record<string, any> {
  // P4-03: public inputs derived from secrets (collectionRoot, expectedHash,
  // commitmentHash) are ALWAYS computed from the private inputs. Any value
  // the caller supplies for those fields is discarded so a malicious UI
  // cannot feed in a pre-chosen root/hash to bypass the circuit's ownership
  // / preimage checks.

  if (templateId === 'nft-ownership') {
    const nftTokenId = params.nftTokenId || params.tokenId;
    const ownerSecret = params.ownerSecret;
    const collectionSize = params.collectionSize || params.maxTokenId;

    if (!nftTokenId || !ownerSecret) {
      throw new Error('nft-ownership requires nftTokenId and ownerSecret');
    }

    const ownerHash = poseidon2([BigInt(nftTokenId), BigInt(ownerSecret)]);
    const collectionRoot = poseidon1([ownerHash]);

    return {
      ...params,
      nftTokenId,
      ownerSecret,
      // Always computed — never accept a caller-supplied value.
      collectionRoot: collectionRoot.toString(),
      minTokenId: params.minTokenId || '1',
      maxTokenId: collectionSize || '10000',
    };
  }

  if (templateId === 'quadratic-voting') {
    const tokenBalance = parseInt(params.tokenBalance || '0', 10);
    const sqrtVal = Math.floor(Math.sqrt(tokenBalance));
    return {
      ...params,
      sqrtVal: sqrtVal.toString(),
    };
  }

  if (templateId === 'hash-preimage') {
    if (!params.preimage || !params.salt) {
      throw new Error('hash-preimage requires preimage and salt');
    }
    return {
      ...params,
      // Always computed from preimage + salt.
      expectedHash: computeHash(params.preimage, params.salt),
    };
  }

  if (templateId === 'credential-proof') {
    const result = { ...params };
    if (!result.currentTime) {
      result.currentTime = Math.floor(Date.now() / 1000).toString();
    }
    // Always derive expectedHash from credentialHash at proving time.
    if (!result.credentialHash) {
      throw new Error('credential-proof requires credentialHash');
    }
    result.expectedHash = result.credentialHash;
    return result;
  }

  if (templateId === 'patience-proof') {
    if (!params.startTime || !params.secret) {
      throw new Error('patience-proof requires startTime and secret');
    }
    return {
      ...params,
      // Always computed from startTime + secret.
      commitmentHash: computeHash(params.startTime, params.secret),
    };
  }

  if (templateId === 'membership-proof') {
    if (params.pathElements && params.root) return params;

    const memberName = params.memberId;
    if (!memberName) return params;

    const isDemoMember = DEMO_MEMBERS.includes(memberName.toLowerCase());
    if (!isDemoMember) return params;

    try {
      const registry = MembershipRegistry.fromMembers(DEMO_MEMBERS);
      return registry.getCircuitInputs(memberName.toLowerCase());
    } catch {
      return params;
    }
  }

  return params;
}

export async function generateClientProof(
  templateId: string,
  inputs: any
): Promise<{
  success: boolean;
  proof?: any;
  error?: string;
  timing?: number;
}> {
  try {
    const startTime = Date.now();

    const circuitInputs = prepareCircuitInputs(templateId, inputs);

    // Dynamically import snarkjs (browser compatible)
    const snarkjs = await import("snarkjs") as any;

    const wasmPath = circuitUrl(`${templateId}.wasm`);
    const zkeyPath = circuitUrl(`${templateId}.zkey`);

    console.log(`[Client ZK] Generating proof for ${templateId}...`);

    // Generate proof in browser
    const { proof: groth16Proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmPath,
      zkeyPath
    );

    const proofTime = Date.now() - startTime;
    console.log(`[Client ZK] Proof generated in ${proofTime}ms`);

    // A15: loadVkey caches + validates the VK structure and throws on
    // unexpected content-type / HTTP status / missing fields.
    const vKey = await loadVkey(templateId);

    let isValid: boolean;
    try {
      isValid = await snarkjs.groth16.verify(vKey, publicSignals, groth16Proof) === true;
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return {
        success: false,
        error: 'Proof generated but local verification failed',
        timing: proofTime,
      };
    }

    // Compute a real SHA-256 digest of the proof so downstream consumers
    // can deduplicate or reference proofs by a collision-resistant id.
    // The old implementation sliced the first 66 characters of JSON.stringify,
    // which was neither a hash nor collision-resistant.
    const proofBytes = new TextEncoder().encode(JSON.stringify(groth16Proof));
    // Cast the Uint8Array's buffer to ArrayBuffer to satisfy the DOM
    // TypedArray lib typing; runtime behavior is unchanged.
    const digest = await crypto.subtle.digest('SHA-256', proofBytes.buffer as ArrayBuffer);
    const proofHash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      success: true,
      proof: {
        groth16Proof,
        publicSignals,
        verificationKey: vKey,
        timestamp: new Date().toISOString(),
        isValid,
        proofHash,
        note: `REAL ZK-SNARK generated in browser! (${(proofTime / 1000).toFixed(2)}s)`,
      },
      timing: proofTime,
    };
  } catch (error: any) {
    console.error('[Client ZK] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate proof',
    };
  }
}
