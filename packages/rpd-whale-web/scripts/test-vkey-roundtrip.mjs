// End-to-end test: generate an RPD whale proof with the production zkey,
// then verify it against each candidate vkey to confirm the fix is correct.
// Run from this package: `node scripts/test-vkey-roundtrip.mjs`

import { readFileSync } from "node:fs";
import * as snarkjs from "snarkjs";
import { PublicKey } from "@solana/web3.js";

const REPO = "/Users/louis/Documents/GitHub/zkrune";
const WEB = `${REPO}/packages/rpd-whale-web`;
const BOT_KEYS = `${REPO}/packages/zkrune-telegram-bot/keys`;

function addressToField(address) {
  const bytes = new PublicKey(address).toBytes();
  let val = 0n;
  for (let i = 0; i < 31; i++) val = (val << 8n) | BigInt(bytes[i]);
  return val;
}

const snap = JSON.parse(readFileSync(`${WEB}/public/snapshot.json`, "utf-8"));
const addresses = Object.keys(snap.entries);

const THRESHOLD = 10_000_000n;
const addr = addresses.find(
  (a) => BigInt(snap.entries[a].balance) >= THRESHOLD,
);
if (!addr) {
  console.error("No holder in snapshot meets the 10M RPD threshold.");
  process.exit(1);
}
const entry = snap.entries[addr];

console.log("Holder:", addr);
console.log("Balance:", entry.balance);
console.log("Root:", snap.meta.root);
console.log();

const input = {
  address: addressToField(addr).toString(),
  balance: entry.balance,
  pathElements: entry.pathElements,
  pathIndices: entry.pathIndices.map(String),
  nullifierSecret: "12345678901234567890",
  root: snap.meta.root,
  minimumBalance: THRESHOLD.toString(),
};

console.log("Generating proof (10-40s)...");
const t0 = Date.now();
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  `${WEB}/public/circuits/whale-holder.wasm`,
  `${WEB}/public/circuits/whale-holder.zkey`,
);
console.log(`Proof generated in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
console.log("publicSignals = [hasMinimum, nullifier, root, minimumBalance]");
console.log("  hasMinimum    =", publicSignals[0]);
console.log("  nullifier     =", publicSignals[1].slice(0, 20) + "...");
console.log();

const candidates = [
  ["RPD bot vkey (.env.rpd after fix)", `${BOT_KEYS}/whale-holder_rpd_vkey.json`, true],
  ["zkRUNE bot vkey (after fix)", `${BOT_KEYS}/whale-holder_vkey.json`, true],
  ["Stale leftover in data/", `${REPO}/packages/zkrune-telegram-bot/data/whale-holder_vkey.json`, false],
];

let allCorrect = true;
for (const [label, path, expectPass] of candidates) {
  const vkey = JSON.parse(readFileSync(path, "utf-8"));
  let ok = false;
  try {
    ok = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  } catch (e) {
    ok = false;
  }
  const correct = ok === expectPass;
  const mark = ok ? "PASS" : "FAIL";
  const note = expectPass
    ? (ok ? "(expected pass — fix works)" : "(expected pass — FIX BROKEN)")
    : (ok ? "(expected fail — UNEXPECTED PASS)" : "(expected fail — confirms it was stale)");
  console.log(`${correct ? "OK " : "!! "}${mark}  ${label}  ${note}`);
  console.log(`        ${path.replace(REPO + "/", "")}`);
  if (!correct) allCorrect = false;
}

console.log();
console.log(allCorrect ? "RESULT: fix is correct, both bots will verify proofs." : "RESULT: something is off.");
process.exit(allCorrect ? 0 : 1);
