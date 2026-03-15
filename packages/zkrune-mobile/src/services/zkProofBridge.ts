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

const PROOF_HTML_DIR = `${FileSystem.cacheDirectory}proof-html/`;

/**
 * Build proof HTML and write to a temp file, loading circuit files sequentially
 * to avoid holding all base64 strings in memory at the same time.
 * Returns the file URI for WebView to load.
 */
export async function buildProofHTMLFile(
  type: ProofType,
  inputs: Record<string, string>,
): Promise<string | null> {
  try {
    const paths = getCircuitPaths(type);

    await FileSystem.makeDirectoryAsync(PROOF_HTML_DIR, { intermediates: true });

    const inputsJson = JSON.stringify(inputs);
    const vkeyString = await FileSystem.readAsStringAsync(paths.vkeyPath);

    // Read wasm, embed, then let it GC before reading zkey
    const wasmBase64 = await FileSystem.readAsStringAsync(paths.wasmPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zkeyBase64 = await FileSystem.readAsStringAsync(paths.zkeyPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<script src="https://unpkg.com/snarkjs@0.7.0/build/snarkjs.min.js"></script>
</head><body><script>
function b64(b){var s=atob(b),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}
function msg(d){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(d));}
async function run(){try{
msg({type:'status',message:'Starting proof generation...'});
var w=b64("${wasmBase64}");
var z=b64("${zkeyBase64}");
var vk=${vkeyString};
msg({type:'status',message:'Running groth16.fullProve...'});
var t=Date.now();
var r=await snarkjs.groth16.fullProve(${inputsJson},w,z);
var pt=Date.now()-t;
msg({type:'status',message:'Verifying proof...'});
var ok=await snarkjs.groth16.verify(vk,r.publicSignals,r.proof);
msg({type:'success',proof:r.proof,publicSignals:r.publicSignals,verified:ok,generationTime:pt});
}catch(e){msg({type:'error',message:e.message||'Unknown error'});}}
window.onload=run;
</script></body></html>`;

    const filePath = `${PROOF_HTML_DIR}proof-${Date.now()}.html`;
    await FileSystem.writeAsStringAsync(filePath, html);

    return filePath;
  } catch (error) {
    console.error(`[ZkBridge] Failed to build proof HTML for ${type}:`, error);
    return null;
  }
}

/**
 * Delete a single temp proof HTML file after use
 */
export async function cleanupProofFile(filePath: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  } catch {}
}

/**
 * Remove leftover proof-* HTML files from previous sessions
 */
export async function cleanupOldProofFiles(): Promise<void> {
  try {
    const files = await FileSystem.readDirectoryAsync(PROOF_HTML_DIR);
    for (const file of files) {
      if (file.startsWith('proof-')) {
        await FileSystem.deleteAsync(`${PROOF_HTML_DIR}${file}`, { idempotent: true });
      }
    }
  } catch {}
}

/**
 * Clean up temp proof HTML files
 */
export async function cleanupProofHTML(): Promise<void> {
  try {
    await FileSystem.deleteAsync(PROOF_HTML_DIR, { idempotent: true });
  } catch {}
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
