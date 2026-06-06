// Adapter that wires the injected ProofBackend to a zkrune-sdk ZkRune instance.
// Uses structural typing so this package builds without a hard dependency on
// zkrune-sdk (the SDK is an optional peer; there is no workspace link).

import type { Groth16Proof, ProofBackend, SignatureCircuitInputs } from './types';

const CIRCUIT = 'signature-verification';

/** The slice of the zkrune-sdk ZkRune API this adapter relies on. */
export interface ZkRuneLike {
  prove(
    templateId: string,
    inputs: Record<string, string>,
  ): Promise<{
    success?: boolean;
    proof?: { groth16Proof: Groth16Proof; publicSignals: string[] };
  }>;
  verifyRemote(params: {
    circuitName: string;
    proof: Groth16Proof;
    publicSignals: string[];
  }): Promise<{ verified?: boolean; isValid?: boolean }>;
}

/**
 * Build a ProofBackend from a zkrune-sdk ZkRune instance.
 *
 * @example
 *   import { ZkRune } from 'zkrune-sdk';
 *   const backend = createSdkBackend(new ZkRune());
 */
export function createSdkBackend(zk: ZkRuneLike): ProofBackend {
  return {
    async prove(inputs: SignatureCircuitInputs) {
      const result = await zk.prove(CIRCUIT, { ...inputs });
      if (!result.proof) {
        throw new Error('zkrune-sdk prove() returned no proof');
      }
      return { proof: result.proof.groth16Proof, publicSignals: result.proof.publicSignals };
    },
    async verify(proof: Groth16Proof, publicSignals: string[]) {
      const result = await zk.verifyRemote({ circuitName: CIRCUIT, proof, publicSignals });
      return result.verified ?? result.isValid ?? false;
    },
  };
}

/**
 * A verify-only backend for relying parties (e.g. an x402 gate). Verifies the
 * Groth16 proof locally with snarkjs against the supplied verification key.
 * snarkjs is an optional peer dependency, imported lazily.
 *
 * @example
 *   import vkey from './signature-verification_vkey.json';
 *   const backend = localGroth16Backend(vkey);
 */
export function localGroth16Backend(verificationKey: object): ProofBackend {
  return {
    async prove() {
      throw new Error('localGroth16Backend is verify-only');
    },
    async verify(proof: Groth16Proof, publicSignals: string[]) {
      const snarkjs = await import('snarkjs');
      return snarkjs.groth16.verify(verificationKey, publicSignals, proof);
    },
  };
}
