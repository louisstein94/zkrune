// Client-Side ZK Proof Generation (Browser-based, no server!)

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

    // Dynamically import snarkjs (browser compatible)
    // @ts-ignore
    const snarkjs = await import("snarkjs");

    // Load circuit files from public folder
    const wasmPath = `/circuits/${templateId}.wasm`;
    const zkeyPath = `/circuits/${templateId}.zkey`;

    console.log(`[Client ZK] Loading circuit files for ${templateId}...`);

    // Fetch WASM file
    const wasmResponse = await fetch(wasmPath);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to load WASM: ${wasmResponse.status}`);
    }
    const wasmBuffer = await wasmResponse.arrayBuffer();

    // Fetch zkey file  
    const zkeyResponse = await fetch(zkeyPath);
    if (!zkeyResponse.ok) {
      throw new Error(`Failed to load zkey: ${zkeyResponse.status}`);
    }
    const zkeyBuffer = await zkeyResponse.arrayBuffer();

    console.log(`[Client ZK] Files loaded. Generating proof...`);

    // Generate proof in browser!
    const { proof: groth16Proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
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
        note: `🔥 REAL ZK-SNARK generated in browser! (${(proofTime / 1000).toFixed(2)}s)`,
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

