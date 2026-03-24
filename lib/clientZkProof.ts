// Client-Side ZK Proof Generation (Browser-based, no server!)

import { poseidon1, poseidon2 } from 'poseidon-lite';
import { MembershipRegistry } from '@/packages/zkrune-sdk/src/membership/registry';

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

function demoHash(a: string, b: string): string {
  const str = `${a}-${b}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return hash.toString();
}

function prepareCircuitInputs(templateId: string, params: Record<string, any>): Record<string, any> {
  if (templateId === 'nft-ownership') {
    if (params.collectionRoot) return params;

    const nftTokenId = params.nftTokenId || params.tokenId;
    const ownerSecret = params.ownerSecret;
    const collectionSize = params.collectionSize || params.maxTokenId;

    if (nftTokenId && ownerSecret) {
      const ownerHash = poseidon2([BigInt(nftTokenId), BigInt(ownerSecret)]);
      const collectionRoot = poseidon1([ownerHash]);

      return {
        ...params,
        nftTokenId,
        ownerSecret,
        collectionRoot: collectionRoot.toString(),
        minTokenId: params.minTokenId || '1',
        maxTokenId: collectionSize || '10000',
      };
    }
    return params;
  }

  if (templateId === 'hash-preimage') {
    if (!params.expectedHash && params.preimage && params.salt) {
      return {
        ...params,
        expectedHash: demoHash(params.preimage, params.salt),
      };
    }
    return params;
  }

  if (templateId === 'credential-proof') {
    const result = { ...params };
    if (!result.currentTime) {
      result.currentTime = Math.floor(Date.now() / 1000).toString();
    }
    if (!result.expectedHash && result.credentialHash) {
      result.expectedHash = result.credentialHash;
    }
    return result;
  }

  if (templateId === 'patience-proof') {
    if (!params.commitmentHash && params.startTime && params.secret) {
      return {
        ...params,
        commitmentHash: demoHash(params.startTime, params.secret),
      };
    }
    return params;
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

    // Load circuit files from public folder
    const wasmPath = `/circuits/${templateId}.wasm`;
    const zkeyPath = `/circuits/${templateId}.zkey`;

    console.log(`[Client ZK] Generating proof for ${templateId}...`);

    // Generate proof in browser
    const { proof: groth16Proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmPath,
      zkeyPath
    );

    const proofTime = Date.now() - startTime;
    console.log(`[Client ZK] Proof generated in ${proofTime}ms`);

    // Load verification key
    const vkeyResponse = await fetch(`/circuits/${templateId}_vkey.json`);
    const vKey = await vkeyResponse.json();

    // Verify proof
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, groth16Proof);

    return {
      success: true,
      proof: {
        groth16Proof,
        publicSignals,
        verificationKey: vKey,
        timestamp: new Date().toISOString(),
        isValid,
        proofHash: JSON.stringify(groth16Proof).substring(0, 66),
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
