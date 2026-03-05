/**
 * Test ALL circuits on Solana Devnet
 * Run: npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' lib/solana/testAllCircuits.ts
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
} from './converter';

// Configuration
const PROGRAM_ID = '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad';
const RPC_URL = 'https://api.devnet.solana.com';
const CIRCUITS_DIR = path.join(__dirname, '../../circuits');

// All circuits with their template IDs
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

interface TestResult {
  name: string;
  id: number;
  success: boolean;
  signature?: string;
  error?: string;
  duration: number;
}

async function testCircuit(
  circuit: { name: string; id: number },
  connection: Connection,
  payer: Keypair,
  programId: PublicKey
): Promise<TestResult> {
  const startTime = Date.now();
  const circuitDir = path.join(CIRCUITS_DIR, circuit.name);
  
  try {
    // Load circuit files
    const wasmPath = path.join(circuitDir, 'circuit_js/circuit.wasm');
    const zkeyPath = path.join(circuitDir, 'circuit_final.zkey');
    const inputPath = path.join(circuitDir, 'input.json');
    const vkeyPath = path.join(circuitDir, 'verification_key.json');

    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      throw new Error('Missing circuit files');
    }

    // Load inputs
    const inputs = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      zkeyPath
    );

    // Verify locally first
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const localValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    
    if (!localValid) {
      throw new Error('Local verification failed');
    }

    // Convert to Solana format
    const solanaProof = convertProofForSolana(proof);
    const solanaInputs = combinePublicInputs(publicSignals);

    // Build instruction data
    const instructionData = new Uint8Array(1 + 256 + solanaInputs.length);
    instructionData[0] = circuit.id;
    instructionData.set(solanaProof.combined, 1);
    instructionData.set(solanaInputs, 1 + 256);

    // Create and send transaction
    const instruction = new TransactionInstruction({
      keys: [],
      programId,
      data: Buffer.from(instructionData),
    });

    const transaction = new Transaction().add(instruction);
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    return {
      name: circuit.name,
      id: circuit.id,
      success: true,
      signature,
      duration: Date.now() - startTime,
    };

  } catch (error: any) {
    return {
      name: circuit.name,
      id: circuit.id,
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('   zkRune - Testing ALL Circuits on Solana Devnet');
  console.log('='.repeat(70));
  console.log('');

  // Load wallet
  const keypairPath = path.join(process.env.HOME || '~', '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log(`Wallet: ${payer.publicKey.toBase58()}`);

  // Connect to devnet
  const connection = new Connection(RPC_URL, 'confirmed');
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Balance: ${(balance / 1e9).toFixed(4)} SOL`);
  console.log(`Program: ${PROGRAM_ID}`);
  console.log('');

  const programId = new PublicKey(PROGRAM_ID);
  const results: TestResult[] = [];

  // Test each circuit
  for (const circuit of CIRCUITS) {
    process.stdout.write(`[${circuit.id.toString().padStart(2)}] ${circuit.name.padEnd(25)} `);
    
    const result = await testCircuit(circuit, connection, payer, programId);
    results.push(result);

    if (result.success) {
      console.log(`✅ PASS (${(result.duration / 1000).toFixed(1)}s)`);
    } else {
      console.log(`❌ FAIL: ${result.error}`);
    }

    // Small delay between tests
    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log('');
  console.log('='.repeat(70));
  console.log('   SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   Passed: ${passed}/${CIRCUITS.length}`);
  console.log(`   Failed: ${failed}/${CIRCUITS.length}`);
  console.log('');

  if (failed > 0) {
    console.log('   Failed circuits:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`     - ${r.name}: ${r.error}`);
    });
  }

  if (passed > 0) {
    console.log('');
    console.log('   Successful transactions:');
    results.filter(r => r.success).forEach(r => {
      console.log(`     ${r.name}:`);
      console.log(`       https://explorer.solana.com/tx/${r.signature}?cluster=devnet`);
    });
  }

  console.log('');
  console.log('='.repeat(70));
  
  // Exit with error if any failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
