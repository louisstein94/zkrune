// Test the local verify-server.mjs by generating a real Groth16
// age-verification proof and POSTing it to /check.
//
// This script needs `snarkjs` available — easiest is to run it from
// inside the zkRune repo where snarkjs is already installed.
//
// Run:    node test-client.mjs
// Expect: HTTP 200 with { access: "granted", ... }

import { groth16 } from 'snarkjs';
import { resolve } from 'node:path';

const SERVER = process.env.SERVER || 'http://localhost:3000/check';
const REPO_ROOT = process.env.REPO_ROOT || resolve(import.meta.dirname, '../..');

const wasm = resolve(REPO_ROOT, 'public/circuits/age-verification.wasm');
const zkey = resolve(REPO_ROOT, 'public/circuits/age-verification.zkey');

console.log('▶ generating proof');
const { proof, publicSignals } = await groth16.fullProve(
  { birthYear: '1995', currentYear: '2026', minimumAge: '18' },
  wasm,
  zkey,
);
console.log('▶ publicSignals:', publicSignals);

console.log(`▶ POST ${SERVER}`);
const res = await fetch(SERVER, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ circuitName: 'age-verification', proof, publicSignals }),
});
const data = await res.json();

console.log(`HTTP ${res.status}`);
console.log(data);
process.exit(res.status === 200 ? 0 : 1);
