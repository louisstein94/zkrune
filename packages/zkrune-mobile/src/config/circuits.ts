/**
 * zkRune Mobile - Circuit Configuration
 * Bundled circuit files for offline proof generation
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export type CircuitType = 
  | 'age-verification'
  | 'balance-proof'
  | 'membership-proof'
  | 'credential-proof'
  | 'private-voting'
  | 'anonymous-reputation';

export interface CircuitAssets {
  wasm: number; // require() returns a number
  zkey: number;
  verificationKey: any;
}

/**
 * Circuit asset configuration
 * In production, these would be bundled with the app
 * For now, we use remote URLs and cache locally
 */
export const CIRCUIT_REMOTE_BASE = 'https://zkrune.com/circuits';

/**
 * Local circuit cache directory
 */
export const CIRCUIT_CACHE_DIR = `${FileSystem.cacheDirectory}circuits/`;

/**
 * Check if circuits are cached locally
 */
export async function areCircuitsCached(type: CircuitType): Promise<boolean> {
  try {
    const wasmPath = `${CIRCUIT_CACHE_DIR}${type}/circuit.wasm`;
    const zkeyPath = `${CIRCUIT_CACHE_DIR}${type}/circuit_final.zkey`;
    
    const wasmInfo = await FileSystem.getInfoAsync(wasmPath);
    const zkeyInfo = await FileSystem.getInfoAsync(zkeyPath);
    
    return wasmInfo.exists && zkeyInfo.exists;
  } catch {
    return false;
  }
}

/**
 * Download and cache circuit files
 */
export async function downloadCircuit(
  type: CircuitType,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {
    const circuitDir = `${CIRCUIT_CACHE_DIR}${type}/`;
    
    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(circuitDir, { intermediates: true });
    
    // Download WASM file
    onProgress?.(0);
    const wasmUrl = `${CIRCUIT_REMOTE_BASE}/${type}/circuit.wasm`;
    const wasmPath = `${circuitDir}circuit.wasm`;
    
    await FileSystem.downloadAsync(wasmUrl, wasmPath);
    onProgress?.(33);
    
    // Download zkey file
    const zkeyUrl = `${CIRCUIT_REMOTE_BASE}/${type}/circuit_final.zkey`;
    const zkeyPath = `${circuitDir}circuit_final.zkey`;
    
    await FileSystem.downloadAsync(zkeyUrl, zkeyPath);
    onProgress?.(66);
    
    // Download verification key
    const vkeyUrl = `${CIRCUIT_REMOTE_BASE}/${type}/verification_key.json`;
    const vkeyPath = `${circuitDir}verification_key.json`;
    
    await FileSystem.downloadAsync(vkeyUrl, vkeyPath);
    onProgress?.(100);
    
    return true;
  } catch (error) {
    console.error(`[Circuits] Failed to download ${type}:`, error);
    return false;
  }
}

/**
 * Get local path for circuit files
 */
export function getCircuitPaths(type: CircuitType): {
  wasmPath: string;
  zkeyPath: string;
  vkeyPath: string;
} {
  const circuitDir = `${CIRCUIT_CACHE_DIR}${type}/`;
  
  return {
    wasmPath: `${circuitDir}circuit.wasm`,
    zkeyPath: `${circuitDir}circuit_final.zkey`,
    vkeyPath: `${circuitDir}verification_key.json`,
  };
}

/**
 * Get circuit file sizes for download progress
 */
export const CIRCUIT_SIZES: Record<CircuitType, { wasm: number; zkey: number }> = {
  'age-verification': { wasm: 500000, zkey: 3000000 },
  'balance-proof': { wasm: 450000, zkey: 2800000 },
  'membership-proof': { wasm: 600000, zkey: 3500000 },
  'credential-proof': { wasm: 550000, zkey: 3200000 },
  'private-voting': { wasm: 700000, zkey: 4000000 },
  'anonymous-reputation': { wasm: 650000, zkey: 3800000 },
};

/**
 * Get total size for all circuits
 */
export function getTotalCircuitSize(): number {
  return Object.values(CIRCUIT_SIZES).reduce(
    (total, { wasm, zkey }) => total + wasm + zkey,
    0
  );
}

/**
 * Clear circuit cache
 */
export async function clearCircuitCache(): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(CIRCUIT_CACHE_DIR, { idempotent: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Download all circuits for offline use
 */
export async function downloadAllCircuits(
  onProgress?: (circuit: CircuitType, progress: number) => void
): Promise<boolean> {
  const circuits: CircuitType[] = [
    'age-verification',
    'balance-proof',
    'membership-proof',
    'credential-proof',
    'private-voting',
    'anonymous-reputation',
  ];
  
  for (const circuit of circuits) {
    const success = await downloadCircuit(circuit, (progress) => {
      onProgress?.(circuit, progress);
    });
    
    if (!success) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get cached circuits count
 */
export async function getCachedCircuitsCount(): Promise<number> {
  const circuits: CircuitType[] = [
    'age-verification',
    'balance-proof',
    'membership-proof',
    'credential-proof',
    'private-voting',
    'anonymous-reputation',
  ];
  
  let count = 0;
  
  for (const circuit of circuits) {
    if (await areCircuitsCached(circuit)) {
      count++;
    }
  }
  
  return count;
}
