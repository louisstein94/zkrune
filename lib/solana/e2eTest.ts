/**
 * End-to-End Test: Generate proof → Convert → Send to Solana → Verify
 * Run: npx ts-node lib/solana/e2eTest.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  Keypair,
  sendAndConfirmTransaction
} from '@solana/web3.js';

const snarkjs = require('snarkjs');

import {
  convertProofForSolana,
  combinePublicInputs,
  bytesToHex,
} from './converter';

// Configuration
const PROGRAM_ID = '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const CIRCUIT_DIR = path.join(__dirname, '../../circuits/age-verification');

async function main() {
  console.log('='.repeat(60));
  console.log('zkRune - End-to-End On-Chain Verification Test');
  console.log('='.repeat(60));

  // Step 1: Load circuit files
  console.log('\n[1] Loading circuit files...');
  const wasmPath = path.join(CIRCUIT_DIR, 'circuit_js/circuit.wasm');
  const zkeyPath = path.join(CIRCUIT_DIR, 'circuit_final.zkey');

  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found: ${wasmPath}`);
  }
  if (!fs.existsSync(zkeyPath)) {
    throw new Error(`ZKey file not found: ${zkeyPath}`);
  }
  console.log('   Circuit files found');

  // Step 2: Prepare inputs
  console.log('\n[2] Preparing inputs...');
  // Circuit uses years, not timestamps
  const birthYear = 1990;
  const currentYear = 2026;
  const minimumAge = 18;

  const inputs = {
    birthYear: birthYear,
    currentYear: currentYear,
    minimumAge: minimumAge
  };
  console.log('   Birth Year:', birthYear);
  console.log('   Current Year:', currentYear);
  console.log('   Min age:', minimumAge, 'years');
  console.log('   Age:', currentYear - birthYear, 'years');

  // Step 3: Generate proof with snarkjs
  console.log('\n[3] Generating proof with snarkjs...');
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath
  );
  console.log('   Proof generated!');
  console.log('   Public signals:', publicSignals);

  // Step 4: Verify locally first
  console.log('\n[4] Verifying locally...');
  const vkeyPath = path.join(CIRCUIT_DIR, 'verification_key.json');
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
  const localValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  console.log('   Local verification:', localValid ? '✅ PASSED' : '❌ FAILED');

  if (!localValid) {
    throw new Error('Local verification failed - aborting');
  }

  // Step 5: Convert to Solana format
  console.log('\n[5] Converting to Solana format...');
  
  // DEBUG: Log raw snarkjs proof values
  console.log('\n--- RAW SNARKJS PROOF ---');
  console.log('pi_a[0] (x):', proof.pi_a[0]);
  console.log('pi_a[1] (y):', proof.pi_a[1]);
  console.log('pi_b[0][0] (x.c1):', proof.pi_b[0][0]);
  console.log('pi_b[0][1] (x.c0):', proof.pi_b[0][1]);
  console.log('pi_b[1][0] (y.c1):', proof.pi_b[1][0]);
  console.log('pi_b[1][1] (y.c0):', proof.pi_b[1][1]);
  console.log('pi_c[0] (x):', proof.pi_c[0]);
  console.log('pi_c[1] (y):', proof.pi_c[1]);
  
  const solanaProof = convertProofForSolana(proof);
  const solanaInputs = combinePublicInputs(publicSignals);
  
  console.log('\n--- CONVERTED BYTES (HEX) ---');
  console.log('proof_a (64 bytes):');
  console.log('  A.x:', bytesToHex(solanaProof.proof_a.slice(0, 32)));
  console.log('  A.y:', bytesToHex(solanaProof.proof_a.slice(32, 64)));
  console.log('proof_b (128 bytes):');
  console.log('  B.x.c0:', bytesToHex(solanaProof.proof_b.slice(0, 32)));
  console.log('  B.x.c1:', bytesToHex(solanaProof.proof_b.slice(32, 64)));
  console.log('  B.y.c0:', bytesToHex(solanaProof.proof_b.slice(64, 96)));
  console.log('  B.y.c1:', bytesToHex(solanaProof.proof_b.slice(96, 128)));
  console.log('proof_c (64 bytes):');
  console.log('  C.x:', bytesToHex(solanaProof.proof_c.slice(0, 32)));
  console.log('  C.y:', bytesToHex(solanaProof.proof_c.slice(32, 64)));
  console.log('public_inputs:');
  publicSignals.forEach((sig: string, i: number) => {
    console.log(`  [${i}] (${sig}):`, bytesToHex(solanaInputs.slice(i * 32, (i + 1) * 32)));
  });
  
  console.log('\n   proof_a:', solanaProof.proof_a.length, 'bytes');
  console.log('   proof_b:', solanaProof.proof_b.length, 'bytes');
  console.log('   proof_c:', solanaProof.proof_c.length, 'bytes');
  console.log('   public inputs:', solanaInputs.length, 'bytes');

  // Step 6: Build instruction data
  console.log('\n[6] Building transaction...');
  
  // Format: [template_id(1)] + [proof_a(64)] + [proof_b(128)] + [proof_c(64)] + [public_inputs(96)]
  const templateId = 0; // age-verification
  const instructionData = new Uint8Array(1 + 256 + solanaInputs.length);
  instructionData[0] = templateId;
  instructionData.set(solanaProof.combined, 1);
  instructionData.set(solanaInputs, 1 + 256);

  console.log('   Instruction data:', instructionData.length, 'bytes');
  console.log('   Template ID:', templateId);

  // Step 7: Load wallet
  console.log('\n[7] Loading wallet...');
  const keypairPath = path.join(process.env.HOME || '~', '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log('   Wallet:', payer.publicKey.toBase58());

  // Step 8: Create and send transaction
  console.log('\n[8] Sending transaction to Solana devnet...');
  const connection = new Connection(RPC_URL, 'confirmed');
  const programId = new PublicKey(PROGRAM_ID);

  const instruction = new TransactionInstruction({
    keys: [],
    programId,
    data: Buffer.from(instructionData),
  });

  const transaction = new Transaction().add(instruction);

  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    console.log('\n' + '='.repeat(60));
    console.log('ON-CHAIN VERIFICATION SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log('Transaction:', signature);
    console.log('Explorer:', `https://explorer.solana.com/tx/${signature}`);
  } catch (error: any) {
    console.log('\nTransaction failed:', error.message);
    if (error.logs) {
      console.log('Program logs:');
      error.logs.forEach((log: string) => console.log('  ', log));
    }
    throw error;
  }
}

main().catch(console.error);
