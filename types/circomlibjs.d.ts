// Minimal ambient declarations for circomlibjs (^0.1.7), which ships no types.
// We only declare the surface this package actually uses: the EdDSA-Poseidon
// signer/verifier and the Poseidon hash, plus the finite-field helpers needed
// to move between field elements and bigints.
declare module 'circomlibjs' {
  /** A finite-field element as used internally by circomlibjs (Montgomery form). */
  export type FieldElement = Uint8Array;

  export interface FiniteField {
    /** Field modulus. */
    p: bigint;
    /** Lift a bigint/number into a field element. */
    e(value: bigint | number | string): FieldElement;
    /** Lower a field element to a canonical bigint. */
    toObject(el: FieldElement): bigint;
  }

  export interface EdDSASignature {
    R8: [FieldElement, FieldElement];
    S: bigint;
  }

  export interface Eddsa {
    F: FiniteField;
    babyJub: { F: FiniteField };
    /** Derive the BabyJubJub public key [Ax, Ay] from a 32-byte private key. */
    prv2pub(privateKey: Uint8Array): [FieldElement, FieldElement];
    signPoseidon(privateKey: Uint8Array, message: FieldElement): EdDSASignature;
    verifyPoseidon(
      message: FieldElement,
      signature: EdDSASignature,
      publicKey: [FieldElement, FieldElement],
    ): boolean;
  }

  export interface Poseidon {
    (inputs: Array<bigint | number | FieldElement>): FieldElement;
    F: FiniteField;
  }

  export function buildEddsa(): Promise<Eddsa>;
  export function buildPoseidon(): Promise<Poseidon>;
}
