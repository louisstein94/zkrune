// Minimal ambient declaration for snarkjs (optional peer dep), which ships no
// types. We only declare the Groth16 verification surface used here.
declare module 'snarkjs' {
  export const groth16: {
    verify(
      verificationKey: object,
      publicSignals: string[],
      proof: unknown,
    ): Promise<boolean>;
  };
}
