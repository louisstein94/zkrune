// End-to-end roundtrip test for whale-holder-v2.
//
// Builds a single-leaf sparse Merkle tree (depth 20), generates a proof
// proving knowledge of the BJJ secret key whose pubkey is the registered
// leaf, then verifies the proof with the freshly minted vkey.
//
// Run from circuits/whale-holder-v2/:
//   node test-roundtrip.mjs

import { readFileSync } from "node:fs";
import { buildBabyjub, buildPoseidon } from "circomlibjs";
import * as snarkjs from "snarkjs";

const DIR = "/Users/louis/Documents/GitHub/zkrune/circuits/whale-holder-v2";
const DEPTH = 20;
const THRESHOLD = 10_000_000n;

async function main() {
  const babyjub = await buildBabyjub();
  const poseidon = await buildPoseidon();
  const F = babyjub.F;

  // ── 1. Random BJJ secret key (field element, < subgroup order) ────────────
  // For test purposes a 31-byte random is fine; in practice clients use a
  // proper sub-order-bounded sampling. Same field as BN254 fr.
  const skBytes = new Uint8Array(31);
  crypto.getRandomValues(skBytes);
  let bjjSk = 0n;
  for (const b of skBytes) bjjSk = (bjjSk << 8n) | BigInt(b);

  // ── 2. Derive bjj_pk = bjj_sk * G ─────────────────────────────────────────
  const [Ax, Ay] = babyjub.mulPointEscalar(babyjub.Base8, bjjSk);
  const pkX = F.toObject(Ax);
  const pkY = F.toObject(Ay);

  console.log("BJJ secret (hex first 8): 0x" + bjjSk.toString(16).slice(0, 16) + "…");
  console.log("BJJ pubkey:");
  console.log("  x =", pkX.toString().slice(0, 24) + "…");
  console.log("  y =", pkY.toString().slice(0, 24) + "…");

  const balance = 11_960_432n;
  console.log("Balance:", balance.toString());

  // ── 3. Compute leaf = Poseidon(pk_x, pk_y, balance) ───────────────────────
  const poseidonBig = (arr) => F.toObject(poseidon(arr));
  const leaf = poseidonBig([pkX, pkY, balance]);
  console.log("Leaf:", leaf.toString().slice(0, 24) + "…");

  // ── 4. Build a depth-20 tree with a single leaf at index 0 ────────────────
  // All other leaves are ZERO. So path siblings are the zero-hashes at each level.
  // zero[0] = Poseidon(0, 0), zero[i+1] = Poseidon(zero[i], zero[i]).
  const zero = [poseidonBig([0n, 0n])];
  for (let i = 1; i <= DEPTH; i++) zero.push(poseidonBig([zero[i - 1], zero[i - 1]]));

  // Walk leaf up to root with sibling = zero[layer]
  const pathElements = [];
  const pathIndices = [];
  let cur = leaf;
  for (let i = 0; i < DEPTH; i++) {
    pathElements.push(zero[i].toString());
    pathIndices.push(0); // index 0 → always left child
    cur = poseidonBig([cur, zero[i]]);
  }
  const root = cur;
  console.log("Root:", root.toString().slice(0, 24) + "…");

  // ── 5. Generate proof ─────────────────────────────────────────────────────
  const input = {
    bjjSk: bjjSk.toString(),
    balance: balance.toString(),
    pathElements,
    pathIndices: pathIndices.map(String),
    root: root.toString(),
    minimumBalance: THRESHOLD.toString(),
  };

  console.log("\nGenerating proof…");
  const t0 = Date.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    `${DIR}/circuit_js/circuit.wasm`,
    `${DIR}/circuit_final.zkey`,
  );
  const proveMs = Date.now() - t0;
  console.log(`Proof generated in ${(proveMs / 1000).toFixed(2)}s`);
  console.log("publicSignals = [hasMinimum, nullifier, root, minimumBalance]");
  console.log("  hasMinimum  =", publicSignals[0]);
  console.log("  nullifier   =", publicSignals[1].slice(0, 20) + "…");
  console.log("  root match  =", publicSignals[2] === root.toString());
  console.log("  minBal match=", publicSignals[3] === THRESHOLD.toString());

  // ── 6. Verify ─────────────────────────────────────────────────────────────
  const vkey = JSON.parse(readFileSync(`${DIR}/verification_key.json`, "utf-8"));
  const ok = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  console.log("\nVerify with fresh vkey:", ok ? "PASS" : "FAIL");

  // ── 7. Negative test: tamper with public signal ───────────────────────────
  const tampered = [...publicSignals];
  tampered[3] = (BigInt(tampered[3]) - 1n).toString(); // lower minimumBalance
  const bad = await snarkjs.groth16.verify(vkey, tampered, proof);
  console.log("Verify with tampered minBal:", bad ? "FAIL (unexpected)" : "PASS (rejected)");

  // ── 8. Nullifier determinism check ─────────────────────────────────────────
  const { publicSignals: ps2 } = await snarkjs.groth16.fullProve(
    input,
    `${DIR}/circuit_js/circuit.wasm`,
    `${DIR}/circuit_final.zkey`,
  );
  console.log(
    "Nullifier deterministic (same sk + root):",
    publicSignals[1] === ps2[1] ? "PASS" : "FAIL",
  );

  const allPass = ok && !bad && publicSignals[1] === ps2[1];
  console.log("\nRESULT:", allPass ? "ALL CHECKS PASS" : "SOMETHING FAILED");
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
