declare module 'snarkjs' {
  export namespace wtns {
    function calculate(
      input: any,
      wasmBuffer: Uint8Array | Buffer,
      outputPath?: string
    ): Promise<{ wtns: Buffer }>;
  }

  export namespace groth16 {
    function prove(
      zkeyBuffer: Uint8Array | Buffer,
      witnessBuffer: Uint8Array | Buffer
    ): Promise<{ proof: any; publicSignals: string[] }>;

    function verify(
      vKey: any,
      publicSignals: string[],
      proof: any
    ): Promise<boolean>;
  }

  export namespace zKey {
    function exportVerificationKey(
      zkeyBuffer: Uint8Array | Buffer
    ): Promise<any>;
  }
}

