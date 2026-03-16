import type { WidgetConfig, CircuitId, VerifyResult, Groth16Proof, WidgetError } from './types';
import { validateInputs } from './circuits';
import { WidgetUI } from './ui';

const SNARKJS_CDN = 'https://cdn.jsdelivr.net/npm/snarkjs@0.7.4/build/snarkjs.min.js';
const DEFAULT_CIRCUIT_BASE = 'https://zkrune.com/circuits';
const DEFAULT_VERIFIER_URL = 'https://zkrune.com/api/verify-proof';

let snarkjsPromise: Promise<any> | null = null;

function loadSnarkjs(): Promise<any> {
  if (snarkjsPromise) return snarkjsPromise;

  if (typeof (window as any).snarkjs !== 'undefined') {
    snarkjsPromise = Promise.resolve((window as any).snarkjs);
    return snarkjsPromise;
  }

  snarkjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SNARKJS_CDN;
    script.onload = () => {
      if ((window as any).snarkjs) resolve((window as any).snarkjs);
      else reject(new Error('snarkjs loaded but not available on window'));
    };
    script.onerror = () => reject(new Error('Failed to load snarkjs from CDN'));
    document.head.appendChild(script);
  });

  return snarkjsPromise;
}

async function hashProof(proof: Groth16Proof): Promise<string> {
  const data = JSON.stringify(proof);
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface WidgetInstance {
  destroy: () => void;
}

export function init(config: WidgetConfig): WidgetInstance {
  const container = typeof config.container === 'string'
    ? document.querySelector(config.container) as HTMLElement
    : config.container;

  if (!container) throw new Error(`zkRune Widget: container "${config.container}" not found`);

  const theme = config.theme ?? 'dark';
  const circuitBaseUrl = (config.circuitBaseUrl ?? DEFAULT_CIRCUIT_BASE).replace(/\/$/, '');
  const verifierUrl = config.verifierUrl ?? DEFAULT_VERIFIER_URL;
  const buttonLabel = config.buttonLabel ?? 'Verify with zkRune';

  const ui = new WidgetUI(container, theme, buttonLabel, config.circuit);

  ui.on('submit', async (circuitId: CircuitId, inputs: Record<string, string>) => {
    const validation = validateInputs(circuitId, inputs);
    if (!validation.valid) {
      const err: WidgetError = { code: 'INVALID_INPUTS', message: validation.errors.join(', ') };
      config.onError?.(err);
      ui.setStage('result', { error: validation.errors.join('\n') });
      return;
    }

    try {
      ui.setStage('proving');

      const snarkjs = await loadSnarkjs();

      const [wasmResp, zkeyResp] = await Promise.all([
        fetch(`${circuitBaseUrl}/${circuitId}.wasm`),
        fetch(`${circuitBaseUrl}/${circuitId}.zkey`),
      ]);

      if (!wasmResp.ok || !zkeyResp.ok) {
        throw { code: 'CIRCUIT_LOAD_FAILED' as const, message: `Failed to load circuit files for ${circuitId}` };
      }

      const [wasmBuffer, zkeyBuffer] = await Promise.all([
        wasmResp.arrayBuffer(),
        zkeyResp.arrayBuffer(),
      ]);

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        new Uint8Array(wasmBuffer),
        new Uint8Array(zkeyBuffer),
      );

      ui.setStage('verifying');

      const verifyResp = await fetch(verifierUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuitName: circuitId, proof, publicSignals }),
      });

      if (!verifyResp.ok) {
        throw { code: 'NETWORK_ERROR' as const, message: `Verifier returned ${verifyResp.status}` };
      }

      const verifyData = await verifyResp.json();
      const proofHash = await hashProof(proof);

      const result: VerifyResult = {
        verified: verifyData.isValid === true,
        circuitName: circuitId,
        proof,
        publicSignals,
        proofHash,
        timestamp: Date.now(),
      };

      ui.setStage('result', { result });
      config.onResult?.(result);

      if (window.parent !== window) {
        window.parent.postMessage({ type: 'zkrune-result', ...result }, '*');
      }
    } catch (err: any) {
      const widgetError: WidgetError = {
        code: err.code ?? 'PROOF_GENERATION_FAILED',
        message: err.message ?? 'Proof generation failed',
      };
      config.onError?.(widgetError);
      ui.setStage('result', { error: widgetError.message });
    }
  });

  return {
    destroy: () => ui.destroy(),
  };
}

export function verify(
  circuitId: CircuitId,
  inputs: Record<string, string>,
  options?: Partial<WidgetConfig>,
): Promise<VerifyResult> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    const circuitBaseUrl = (options?.circuitBaseUrl ?? DEFAULT_CIRCUIT_BASE).replace(/\/$/, '');
    const verifierUrl = options?.verifierUrl ?? DEFAULT_VERIFIER_URL;

    const validation = validateInputs(circuitId, inputs);
    if (!validation.valid) {
      container.remove();
      reject({ code: 'INVALID_INPUTS', message: validation.errors.join(', ') });
      return;
    }

    (async () => {
      try {
        const snarkjs = await loadSnarkjs();

        const [wasmResp, zkeyResp] = await Promise.all([
          fetch(`${circuitBaseUrl}/${circuitId}.wasm`),
          fetch(`${circuitBaseUrl}/${circuitId}.zkey`),
        ]);

        if (!wasmResp.ok || !zkeyResp.ok) {
          throw { code: 'CIRCUIT_LOAD_FAILED', message: `Failed to load circuit files for ${circuitId}` };
        }

        const [wasmBuffer, zkeyBuffer] = await Promise.all([
          wasmResp.arrayBuffer(),
          zkeyResp.arrayBuffer(),
        ]);

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          inputs,
          new Uint8Array(wasmBuffer),
          new Uint8Array(zkeyBuffer),
        );

        const verifyResp = await fetch(verifierUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ circuitName: circuitId, proof, publicSignals }),
        });

        const verifyData = await verifyResp.json();
        const proofHash = await hashProof(proof);

        const result: VerifyResult = {
          verified: verifyData.isValid === true,
          circuitName: circuitId,
          proof,
          publicSignals,
          proofHash,
          timestamp: Date.now(),
        };

        container.remove();
        resolve(result);
      } catch (err: any) {
        container.remove();
        reject({ code: err.code ?? 'PROOF_GENERATION_FAILED', message: err.message ?? 'Failed' });
      }
    })();
  });
}
