import type { VerificationKey } from '../types';
import { ZkRuneError, ZkRuneErrorCode } from '../utils/errors';
import { Logger } from '../utils/logger';

export interface CircuitFiles {
  wasm: Uint8Array;
  zkey: Uint8Array;
  vkey: VerificationKey;
}

export class CircuitLoader {
  private cache = new Map<string, CircuitFiles>();
  private logger: Logger;
  private baseUrl: string;

  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.logger = logger;
  }

  async load(templateId: string): Promise<CircuitFiles> {
    const cached = this.cache.get(templateId);
    if (cached) {
      this.logger.debug(`Using cached circuit files for ${templateId}`);
      return cached;
    }

    this.logger.info(`Loading circuit files for ${templateId}...`);

    const wasmUrl = `${this.baseUrl}/${templateId}.wasm`;
    const zkeyUrl = `${this.baseUrl}/${templateId}.zkey`;
    const vkeyUrl = `${this.baseUrl}/${templateId}_vkey.json`;

    const results = await Promise.allSettled([
      fetch(wasmUrl),
      fetch(zkeyUrl),
      fetch(vkeyUrl),
    ]);

    const fileNames = ['wasm', 'zkey', 'vkey'] as const;
    const responses: Response[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        throw new ZkRuneError(
          `Failed to fetch ${fileNames[i]} file for ${templateId}: ${result.reason}`,
          ZkRuneErrorCode.CIRCUIT_LOAD_FAILED,
        );
      }
      if (!result.value.ok) {
        throw new ZkRuneError(
          `Failed to fetch ${fileNames[i]} file for ${templateId}: HTTP ${result.value.status}`,
          ZkRuneErrorCode.CIRCUIT_LOAD_FAILED,
        );
      }
      responses.push(result.value);
    }

    const [wasmBuffer, zkeyBuffer, vkey] = await Promise.all([
      responses[0].arrayBuffer().then((b) => new Uint8Array(b)),
      responses[1].arrayBuffer().then((b) => new Uint8Array(b)),
      responses[2].json() as Promise<VerificationKey>,
    ]);

    const files: CircuitFiles = { wasm: wasmBuffer, zkey: zkeyBuffer, vkey };
    this.cache.set(templateId, files);
    this.logger.info(`Circuit files loaded and cached for ${templateId}`);

    return files;
  }

  async preload(templateId: string): Promise<void> {
    await this.load(templateId);
  }

  getCachedIds(): string[] {
    return Array.from(this.cache.keys());
  }

  clearCache(): void {
    this.cache.clear();
  }
}
