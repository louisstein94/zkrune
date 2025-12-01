/**
 * Type declarations for snarkjs
 * snarkjs doesn't have official TypeScript types
 */
declare module 'snarkjs' {
  export const groth16: {
    fullProve: (
      input: any,
      wasmFile: Uint8Array,
      zkeyFile: Uint8Array
    ) => Promise<{ proof: any; publicSignals: string[] }>;
    
    verify: (
      vKey: any,
      publicSignals: string[],
      proof: any
    ) => Promise<boolean>;
    
    setup: (r1cs: any, ptau: any) => Promise<any>;
    exportSolidityCallData: (proof: any, publicSignals: string[]) => Promise<string>;
  };
  
  export const plonk: {
    fullProve: (
      input: any,
      wasmFile: Uint8Array,
      zkeyFile: Uint8Array
    ) => Promise<{ proof: any; publicSignals: string[] }>;
    
    verify: (
      vKey: any,
      publicSignals: string[],
      proof: any
    ) => Promise<boolean>;
  };
  
  export const wtns: {
    calculate: (input: any, wasmFile: Uint8Array) => Promise<Uint8Array>;
  };
}

