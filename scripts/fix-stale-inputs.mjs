#!/usr/bin/env node
/**
 * Regenerate stale circuits/<name>/input.json fixtures so the Sui and
 * circuit-e2e test harnesses can exercise every circuit. Only touches
 * circuits whose existing input.json doesn't satisfy the circuit.
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { poseidon2 } from 'poseidon-lite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

function isqrt(n) {
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}

const fixes = [
  {
    name: 'hash-preimage',
    build: () => {
      const preimage = 42n;
      const salt = 987654321n;
      const expectedHash = poseidon2([preimage, salt]);
      return {
        preimage: preimage.toString(),
        salt: salt.toString(),
        expectedHash: expectedHash.toString(),
      };
    },
  },
  {
    name: 'patience-proof',
    build: () => {
      const startTime = 1700000000n;
      const secret = 123456789n;
      const commitmentHash = poseidon2([startTime, secret]);
      return {
        startTime: startTime.toString(),
        endTime: '1700003600',
        secret: secret.toString(),
        minimumWaitTime: '3600',
        commitmentHash: commitmentHash.toString(),
      };
    },
  },
  {
    name: 'quadratic-voting',
    build: () => {
      const tokenBalance = 10000n;
      const sqrtVal = isqrt(tokenBalance);
      return {
        voterId: '7',
        tokenBalance: tokenBalance.toString(),
        voteChoice: '1',
        sqrtVal: sqrtVal.toString(),
        pollId: '42',
        minTokens: '100',
      };
    },
  },
];

for (const f of fixes) {
  const path = join(REPO_ROOT, 'circuits', f.name, 'input.json');
  const content = f.build();
  writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
  console.log(`✓ ${f.name}: ${path}`);
  console.log(`    ${JSON.stringify(content)}`);
}
