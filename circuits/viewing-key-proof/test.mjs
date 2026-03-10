/**
 * End-to-end test for the viewing-key-proof circuit.
 *
 * Run: node circuits/viewing-key-proof/test.mjs
 */

import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const circuit   = (f) => path.join(__dirname, f);

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const blue  = (s) => `\x1b[34m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const dim   = (s) => `\x1b[2m${s}\x1b[0m`;

function pass(label) { console.log(`  ${green('✓')} ${label}`); }
function fail(label) { console.log(`  ${red('✗')} ${label}`); process.exitCode = 1; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const wasm = circuit('circuit_js/circuit.wasm');
const zkey = circuit('circuit_final.zkey');
const vKey = JSON.parse(readFileSync(circuit('verification_key.json'), 'utf8'));

let _poseidon;
async function getPoseidon() {
  if (!_poseidon) _poseidon = await buildPoseidon();
  return _poseidon;
}

/** Compute Poseidon(a, b) using circomlibjs — same implementation as circomlib. */
async function computePoseidon(a, b) {
  const poseidon = await getPoseidon();
  const hash = poseidon([a, b]);
  return poseidon.F.toObject(hash);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('');
  console.log(bold('  Kage — ZK Viewing Key Proof'));
  console.log(dim('  circuits/viewing-key-proof/circuit.circom'));
  console.log('');

  const viewingKey = 424242n;
  const salt       = 987654321n;

  // Simulate what Kage stores on Solana PDA at memory creation time
  console.log(blue('  ── Setup: deriving on-chain Poseidon hash ───'));
  const onChainHash = await computePoseidon(viewingKey, salt);
  console.log(dim(`  viewingKey   : ${viewingKey}`));
  console.log(dim(`  salt         : ${salt}`));
  console.log(dim(`  onChainHash  : ${onChainHash.toString().slice(0, 30)}...`));
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1 — Valid viewing key → isAuthorized = 1
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(blue('  ── Test 1: Valid viewing key ────────────────'));
  {
    const t0 = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        viewingKey:     viewingKey.toString(),
        salt:           salt.toString(),
        viewingKeyHash: onChainHash.toString(),
      },
      wasm,
      zkey,
    );
    const timingMs = Date.now() - t0;

    // publicSignals layout: [isAuthorized, nullifier, viewingKeyHash]
    const isAuthorized = publicSignals[0];
    const nullifier    = publicSignals[1];

    const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    isAuthorized === '1' ? pass('isAuthorized = 1') : fail(`isAuthorized = ${isAuthorized}`);
    valid                ? pass('Groth16 proof verifies') : fail('Groth16 proof invalid');
    nullifier?.length    ? pass(`Nullifier produced: ${nullifier.slice(0, 25)}...`) : fail('No nullifier');
    console.log(dim(`  Proof size   : ${JSON.stringify(proof).length} bytes`));
    console.log(dim(`  Timing       : ${timingMs}ms`));
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2 — Wrong viewing key → isAuthorized = 0
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(blue('  ── Test 2: Wrong viewing key → access denied '));
  {
    const wrongKey = viewingKey + 1n;

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        viewingKey:     wrongKey.toString(),
        salt:           salt.toString(),
        viewingKeyHash: onChainHash.toString(),
      },
      wasm,
      zkey,
    );

    const isAuthorized = publicSignals[0];
    const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    isAuthorized === '0' ? pass('isAuthorized = 0 (access denied correctly)') : fail(`Expected 0, got ${isAuthorized}`);
    valid                ? pass('Proof structurally valid (but unauthorized)') : fail('Proof verification failed');
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3 — Nullifier is deterministic for same (key, salt)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(blue('  ── Test 3: Deterministic nullifier ──────────'));
  {
    const inputs = {
      viewingKey:     viewingKey.toString(),
      salt:           salt.toString(),
      viewingKeyHash: onChainHash.toString(),
    };

    const { publicSignals: s1 } = await snarkjs.groth16.fullProve(inputs, wasm, zkey);
    const { publicSignals: s2 } = await snarkjs.groth16.fullProve(inputs, wasm, zkey);

    s1[1] === s2[1]
      ? pass('Same inputs → same nullifier (replay detectable)')
      : fail('Nullifier non-deterministic (bug!)');
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4 — Different salts → different nullifiers
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(blue('  ── Test 4: Different salts → unique nullifiers'));
  {
    const salt2       = salt + 1n;
    const onChainHash2 = await computePoseidon(viewingKey, salt2);

    const { publicSignals: s1 } = await snarkjs.groth16.fullProve(
      { viewingKey: viewingKey.toString(), salt: salt.toString(),  viewingKeyHash: onChainHash.toString()  }, wasm, zkey,
    );
    const { publicSignals: s2 } = await snarkjs.groth16.fullProve(
      { viewingKey: viewingKey.toString(), salt: salt2.toString(), viewingKeyHash: onChainHash2.toString() }, wasm, zkey,
    );

    s1[1] !== s2[1]
      ? pass('Different salts → different nullifiers')
      : fail('Nullifier collision (critical bug!)');
    console.log('');
  }

  const exitCode = process.exitCode ?? 0;
  console.log(exitCode === 0
    ? green(bold('  All tests passed.'))
    : red(bold('  Some tests failed.')));
  console.log('');
}

runTests().catch((err) => {
  console.error(red('\n  Fatal error: ' + err.message));
  console.error(err.stack);
  process.exit(1);
});
