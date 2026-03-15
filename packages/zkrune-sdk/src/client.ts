import type {
  ZkRuneConfig,
  TemplateId,
  CircuitInputMap,
  ZKProofResult,
  VerifyResult,
  Groth16Proof,
  VerificationKey,
  ProveOptions,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { CircuitLoader } from './circuits/loader';
import { validateInputs } from './circuits/schemas';
import { prove } from './prover';
import { verifyLocal, verifyRemote } from './verifier';
import { Logger } from './utils/logger';

export class ZkRune {
  private config: ZkRuneConfig;
  private loader: CircuitLoader;
  private logger: Logger;

  constructor(config?: Partial<ZkRuneConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.debug ? 'debug' : 'silent');
    this.loader = new CircuitLoader(this.config.circuitBaseUrl, this.logger);
  }

  async prove<T extends TemplateId>(
    templateId: T,
    inputs: CircuitInputMap[T],
    options?: ProveOptions,
  ): Promise<ZKProofResult> {
    const validation = validateInputs(
      templateId,
      inputs as unknown as Record<string, string>,
    );
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid inputs: ${validation.errors.join(', ')}`,
      };
    }

    const circuitFiles = await this.loader.load(templateId);
    return prove(templateId, inputs, circuitFiles, this.logger, options);
  }

  async verify(
    proof: Groth16Proof,
    publicSignals: string[],
    verificationKey: VerificationKey,
  ): Promise<boolean> {
    return verifyLocal(proof, publicSignals, verificationKey, this.logger);
  }

  async verifyRemote(params: {
    circuitName: string;
    proof: Groth16Proof;
    publicSignals: string[];
  }): Promise<VerifyResult> {
    return verifyRemote({
      ...params,
      verifierUrl: this.config.verifierUrl,
      timeout: this.config.timeout,
      logger: this.logger,
    });
  }

  async preload(templateId: TemplateId): Promise<void> {
    await this.loader.preload(templateId);
  }

  getCachedCircuits(): string[] {
    return this.loader.getCachedIds();
  }
}
