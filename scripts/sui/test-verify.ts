#!/usr/bin/env node
/**
 * End-to-end check for the Sui Groth16 verifier on the currently deployed network.
 *
 * Generates a fresh age-verification proof with snarkjs, converts it to
 * Arkworks canonical compressed form, and calls verify_proof_static via
 * devInspectTransactionBlock (dry-run, no gas needed, no signer needed).
 *
 * Also flips a byte in the proof to confirm tampered proofs return false.
 *
 * Env:
 *   SUI_NETWORK = testnet | mainnet | devnet (default: testnet)
 *   SUI_GROTH16_PACKAGE = 0x... (default: reads from .env.local)
 *   SUI_VERIFIER_REGISTRY = 0x...
 *   SUI_RPC_URL (optional)
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as loadEnv } from 'dotenv';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import * as snarkjs from 'snarkjs';

import {
  convertProofForSui,
  convertPublicInputsForSui,
  bytesToHex,
} from '../../lib/sui/converter.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

loadEnv({ path: join(REPO_ROOT, '.env.local') });
loadEnv({ path: join(REPO_ROOT, '.env') });

const NETWORK = process.env.SUI_NETWORK?.trim() || 'testnet';
const PACKAGE_ID =
  process.env.SUI_GROTH16_PACKAGE?.trim() ||
  process.env.NEXT_PUBLIC_SUI_GROTH16_PACKAGE?.trim();
const REGISTRY_ID =
  process.env.SUI_VERIFIER_REGISTRY?.trim() ||
  process.env.NEXT_PUBLIC_SUI_VERIFIER_REGISTRY?.trim();

if (!PACKAGE_ID || !REGISTRY_ID) {
  console.error('Missing SUI_GROTH16_PACKAGE or SUI_VERIFIER_REGISTRY env.');
  process.exit(1);
}

const TEMPLATE_ID = 0; // age-verification

async function buildProof() {
  const wasm = join(REPO_ROOT, 'public/circuits/age-verification.wasm');
  const zkey = join(REPO_ROOT, 'public/circuits/age-verification.zkey');
  if (!existsSync(wasm) || !existsSync(zkey)) {
    throw new Error(`Missing wasm/zkey under public/circuits/.`);
  }

  const input = {
    birthYear: '1990',
    currentYear: '2025',
    minimumAge: '21',
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasm,
    zkey,
  );

  return { proof, publicSignals };
}

async function callVerifyStatic(client, proofBytes, inputsBytes) {
  const tx = new Transaction();
  tx.setSender('0x0000000000000000000000000000000000000000000000000000000000000000');
  tx.moveCall({
    target: `${PACKAGE_ID}::groth16_verifier::verify_proof_static`,
    arguments: [
      tx.object(REGISTRY_ID),
      tx.pure.u8(TEMPLATE_ID),
      tx.pure(bcs.vector(bcs.U8).serialize(Array.from(proofBytes)).toBytes()),
      tx.pure(bcs.vector(bcs.U8).serialize(Array.from(inputsBytes)).toBytes()),
    ],
  });

  const result = await client.devInspectTransactionBlock({
    sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    transactionBlock: tx,
  });

  if (result.error) {
    return { ok: false, error: result.error, raw: result };
  }

  const ret = result.results?.[0]?.returnValues?.[0];
  if (!ret) {
    return { ok: false, error: 'no return value', raw: result };
  }
  const [bytes, type] = ret;
  // bool is serialized as a single byte
  const value = Array.isArray(bytes) ? bytes[0] === 1 : bytes[0] === 1;
  return { ok: true, value, type };
}

async function main() {
  const url = process.env.SUI_RPC_URL?.trim() || getFullnodeUrl(NETWORK);
  const client = new SuiClient({ url });

  console.log('Network:', NETWORK);
  console.log('RPC:', url);
  console.log('Package:', PACKAGE_ID);
  console.log('Registry:', REGISTRY_ID);
  console.log('Template:', TEMPLATE_ID, '(age-verification)');
  console.log('');

  const info = await client.getObject({
    id: REGISTRY_ID,
    options: { showContent: true },
  });
  if (info.error || !info.data) {
    console.error('Registry object not reachable:', info.error);
    process.exit(1);
  }
  console.log('Registry object version:', info.data.version);

  console.log('\n[1/3] Generating real Groth16 proof via snarkjs…');
  const { proof, publicSignals } = await buildProof();
  console.log('    publicSignals:', publicSignals);

  const { proofPointsBytes } = convertProofForSui(proof);
  const publicInputsBytes = convertPublicInputsForSui(publicSignals);
  console.log(
    `    proof bytes: ${proofPointsBytes.length}B, inputs bytes: ${publicInputsBytes.length}B`,
  );

  console.log('\n[2/3] Calling verify_proof_static with VALID proof…');
  const good = await callVerifyStatic(client, proofPointsBytes, publicInputsBytes);
  if (!good.ok) {
    console.error('    devInspect failed:', good.error);
    process.exit(1);
  }
  console.log('    result:', good.value ? 'true ✅' : 'false ❌');

  console.log('\n[3/3] Calling verify_proof_static with TAMPERED proof…');
  const tampered = new Uint8Array(proofPointsBytes);
  tampered[0] ^= 0x01;
  const bad = await callVerifyStatic(client, tampered, publicInputsBytes);
  if (!bad.ok) {
    console.error('    devInspect failed:', bad.error);
    process.exit(1);
  }
  console.log('    result:', bad.value ? 'true (UNEXPECTED ❌)' : 'false ✅');

  const pass = good.value === true && bad.value === false;
  console.log('\n' + (pass ? '✅ PASS' : '❌ FAIL'));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
