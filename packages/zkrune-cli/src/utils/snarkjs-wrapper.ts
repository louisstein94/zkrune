import path from 'path';
import fs from 'fs-extra';

/**
 * Wrapper for snarkjs operations
 */
export class SnarkjsWrapper {
  private snarkjs: any;

  async initialize() {
    // Dynamic import of snarkjs
    this.snarkjs = await import('snarkjs') as any;
  }

  /**
   * Generate witness from circuit and inputs
   */
  async generateWitness(
    wasmPath: string,
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    if (!this.snarkjs) await this.initialize();

    const input = await fs.readJson(inputPath);
    const wasmBuffer = await fs.readFile(wasmPath);

    const { wtns } = await this.snarkjs.wtns.calculate(
      input,
      wasmBuffer,
      outputPath
    );

    return wtns;
  }

  /**
   * Generate Groth16 proof
   */
  async generateProof(
    zkeyPath: string,
    witnessPath: string
  ): Promise<{ proof: any; publicSignals: string[] }> {
    if (!this.snarkjs) await this.initialize();

    const zkeyBuffer = await fs.readFile(zkeyPath);
    const witnessBuffer = await fs.readFile(witnessPath);

    const { proof, publicSignals } = await this.snarkjs.groth16.prove(
      zkeyBuffer,
      witnessBuffer
    );

    return { proof, publicSignals };
  }

  /**
   * Verify Groth16 proof
   */
  async verifyProof(
    vkeyPath: string,
    publicSignals: string[],
    proof: any
  ): Promise<boolean> {
    if (!this.snarkjs) await this.initialize();

    const vKey = await fs.readJson(vkeyPath);

    const isValid = await this.snarkjs.groth16.verify(
      vKey,
      publicSignals,
      proof
    );

    return isValid;
  }

  /**
   * Export verification key from zkey
   */
  async exportVerificationKey(
    zkeyPath: string,
    outputPath: string
  ): Promise<void> {
    if (!this.snarkjs) await this.initialize();

    const zkeyBuffer = await fs.readFile(zkeyPath);
    const vKey = await this.snarkjs.zKey.exportVerificationKey(zkeyBuffer);

    await fs.writeJson(outputPath, vKey, { spaces: 2 });
  }
}

