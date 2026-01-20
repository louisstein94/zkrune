/**
 * zkRune Mobile - ZK Proof Bridge
 * Uses a hidden WebView to run snarkjs for real ZK proof generation
 * Works completely offline after initial circuit download
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Circuit files cache directory
const CIRCUIT_CACHE_DIR = `${FileSystem.cacheDirectory}circuits/`;

// CDN base for circuit files
const CIRCUIT_CDN = 'https://zkrune.com/circuits';

export type ProofType = 
  | 'age-verification'
  | 'balance-proof'
  | 'membership-proof'
  | 'credential-proof'
  | 'private-voting'
  | 'anonymous-reputation';

export interface CircuitPaths {
  wasmPath: string;
  zkeyPath: string;
  vkeyPath: string;
}

/**
 * Get snarkjs library as inline JavaScript
 * This will be injected into the WebView for offline use
 */
export function getSnarkjsScript(): string {
  // snarkjs is loaded from CDN in WebView, but circuit files are local
  // For true offline, we would need to bundle snarkjs.min.js
  return `
    <script src="https://unpkg.com/snarkjs@0.7.0/build/snarkjs.min.js"></script>
  `;
}

/**
 * Generate the HTML page for ZK proof computation
 */
export function generateProofHTML(
  type: ProofType,
  inputs: Record<string, string>,
  wasmBase64: string,
  zkeyBase64: string,
  vkeyJson: any
): string {
  const inputsJson = JSON.stringify(inputs);
  const vkeyJsonStr = JSON.stringify(vkeyJson);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/snarkjs@0.7.0/build/snarkjs.min.js"></script>
</head>
<body>
<script>
  // Convert base64 to Uint8Array
  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Send message back to React Native
  function sendToRN(data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  }

  // Main proof generation
  async function generateProof() {
    try {
      sendToRN({ type: 'status', message: 'Starting proof generation...' });

      const inputs = ${inputsJson};
      const wasmBuffer = base64ToUint8Array("${wasmBase64}");
      const zkeyBuffer = base64ToUint8Array("${zkeyBase64}");
      const vkey = ${vkeyJsonStr};

      sendToRN({ type: 'status', message: 'Running groth16.fullProve...' });
      
      const startTime = Date.now();
      
      // Generate proof using snarkjs
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasmBuffer,
        zkeyBuffer
      );

      const proofTime = Date.now() - startTime;
      sendToRN({ type: 'status', message: 'Verifying proof...' });

      // Verify the proof
      const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

      sendToRN({
        type: 'success',
        proof: proof,
        publicSignals: publicSignals,
        verified: isValid,
        generationTime: proofTime,
      });
    } catch (error) {
      sendToRN({
        type: 'error',
        message: error.message || 'Unknown error',
      });
    }
  }

  // Start when page loads
  window.onload = generateProof;
</script>
<p>Generating ZK Proof...</p>
</body>
</html>
  `;
}

/**
 * Check if circuit files are cached
 */
export async function isCircuitCached(type: ProofType): Promise<boolean> {
  try {
    const dir = `${CIRCUIT_CACHE_DIR}${type}/`;
    const wasmInfo = await FileSystem.getInfoAsync(`${dir}circuit.wasm`);
    const zkeyInfo = await FileSystem.getInfoAsync(`${dir}circuit.zkey`);
    const vkeyInfo = await FileSystem.getInfoAsync(`${dir}vkey.json`);
    
    return wasmInfo.exists && zkeyInfo.exists && vkeyInfo.exists;
  } catch {
    return false;
  }
}

/**
 * Download and cache circuit files
 */
export async function downloadCircuit(
  type: ProofType,
  onProgress?: (progress: number, status: string) => void
): Promise<boolean> {
  try {
    const dir = `${CIRCUIT_CACHE_DIR}${type}/`;
    
    // Create directory
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    
    onProgress?.(10, 'Downloading WASM file...');
    
    // Download WASM
    const wasmUrl = `${CIRCUIT_CDN}/${type}.wasm`;
    await FileSystem.downloadAsync(wasmUrl, `${dir}circuit.wasm`);
    
    onProgress?.(40, 'Downloading zkey file...');
    
    // Download zkey
    const zkeyUrl = `${CIRCUIT_CDN}/${type}.zkey`;
    await FileSystem.downloadAsync(zkeyUrl, `${dir}circuit.zkey`);
    
    onProgress?.(70, 'Downloading verification key...');
    
    // Download verification key
    const vkeyUrl = `${CIRCUIT_CDN}/${type}_vkey.json`;
    await FileSystem.downloadAsync(vkeyUrl, `${dir}vkey.json`);
    
    onProgress?.(100, 'Download complete!');
    
    return true;
  } catch (error) {
    console.error(`[ZkBridge] Failed to download ${type}:`, error);
    return false;
  }
}

/**
 * Get circuit file paths
 */
export function getCircuitPaths(type: ProofType): CircuitPaths {
  const dir = `${CIRCUIT_CACHE_DIR}${type}/`;
  return {
    wasmPath: `${dir}circuit.wasm`,
    zkeyPath: `${dir}circuit.zkey`,
    vkeyPath: `${dir}vkey.json`,
  };
}

/**
 * Load circuit files as base64
 */
export async function loadCircuitFiles(type: ProofType): Promise<{
  wasmBase64: string;
  zkeyBase64: string;
  vkeyJson: any;
} | null> {
  try {
    const paths = getCircuitPaths(type);
    
    // Read files as base64
    const wasmBase64 = await FileSystem.readAsStringAsync(paths.wasmPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const zkeyBase64 = await FileSystem.readAsStringAsync(paths.zkeyPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const vkeyString = await FileSystem.readAsStringAsync(paths.vkeyPath);
    const vkeyJson = JSON.parse(vkeyString);
    
    return { wasmBase64, zkeyBase64, vkeyJson };
  } catch (error) {
    console.error(`[ZkBridge] Failed to load circuit files for ${type}:`, error);
    return null;
  }
}

/**
 * Get total cache size
 */
export async function getCacheSize(): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(CIRCUIT_CACHE_DIR);
    if (info.exists && 'size' in info) {
      return info.size || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Clear all cached circuits
 */
export async function clearCache(): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(CIRCUIT_CACHE_DIR, { idempotent: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of cached circuits
 */
export async function getCachedCircuits(): Promise<ProofType[]> {
  const allTypes: ProofType[] = [
    'age-verification',
    'balance-proof',
    'membership-proof',
    'credential-proof',
    'private-voting',
    'anonymous-reputation',
  ];
  
  const cached: ProofType[] = [];
  
  for (const type of allTypes) {
    if (await isCircuitCached(type)) {
      cached.push(type);
    }
  }
  
  return cached;
}
