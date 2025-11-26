declare module 'snarkjs' {
  export namespace groth16 {
    function fullProve(
      input: any,
      wasmBuffer: Uint8Array | Buffer,
      zkeyBuffer: Uint8Array | Buffer
    ): Promise<{ proof: any; publicSignals: string[] }>;

    function verify(
      vKey: any,
      publicSignals: string[],
      proof: any
    ): Promise<boolean>;
  }
}

