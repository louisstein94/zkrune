declare module "circomlibjs" {
  export function buildBabyjub(): Promise<{
    Base8: [Uint8Array, Uint8Array];
    F: {
      toObject(x: Uint8Array): bigint;
      e(x: bigint | string | number): Uint8Array;
    };
    mulPointEscalar(p: [Uint8Array, Uint8Array], e: bigint): [Uint8Array, Uint8Array];
  }>;
  export function buildPoseidon(): Promise<((inputs: (bigint | string | number)[]) => Uint8Array) & {
    F: { toObject(x: Uint8Array): bigint };
  }>;
}
