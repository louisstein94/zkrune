/**
 * Generate Sui VK registration data from snarkjs verification keys.
 * Converts each circuit's verification_key.json to Arkworks compressed format
 * and outputs the hex bytes needed for register_circuit transactions.
 *
 * Run: npx tsx lib/sui/generateMoveVK.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { convertVKForSui, bytesToHex } from './converter';

const CIRCUITS = [
  { name: 'age-verification', id: 0 },
  { name: 'balance-proof', id: 1 },
  { name: 'membership-proof', id: 2 },
  { name: 'credential-proof', id: 3 },
  { name: 'private-voting', id: 4 },
  { name: 'nft-ownership', id: 5 },
  { name: 'range-proof', id: 6 },
  { name: 'hash-preimage', id: 7 },
  { name: 'quadratic-voting', id: 8 },
  { name: 'anonymous-reputation', id: 9 },
  { name: 'token-swap', id: 10 },
  { name: 'patience-proof', id: 11 },
  { name: 'signature-verification', id: 12 },
];

interface CircuitVKData {
  templateId: number;
  name: string;
  nPublic: number;
  vkHex: string;
  vkBytesLength: number;
}

function generateAll(): CircuitVKData[] {
  const results: CircuitVKData[] = [];

  console.log('Generating Sui VK data for all circuits...\n');

  for (const circuit of CIRCUITS) {
    const vkPath = path.join(
      __dirname,
      `../../circuits/${circuit.name}/verification_key.json`,
    );

    if (!fs.existsSync(vkPath)) {
      console.log(`⚠️  Skipping ${circuit.name} - verification_key.json not found`);
      continue;
    }

    const vkJson = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    const { nPublic, vkBytes } = convertVKForSui(vkJson);

    const data: CircuitVKData = {
      templateId: circuit.id,
      name: circuit.name,
      nPublic,
      vkHex: bytesToHex(vkBytes),
      vkBytesLength: vkBytes.length,
    };

    results.push(data);
    console.log(
      `✓ ${circuit.name} (ID: ${circuit.id}, nPublic: ${nPublic}, ${vkBytes.length} bytes)`,
    );
  }

  return results;
}

const circuits = generateAll();

const jsonOutputPath = path.join(
  __dirname,
  '../../sui-groth16-verifier/vk_data.json',
);
fs.writeFileSync(jsonOutputPath, JSON.stringify(circuits, null, 2));
console.log(`\n✅ JSON VK data written to: ${jsonOutputPath}`);
console.log(`   ${circuits.length} circuits processed`);
