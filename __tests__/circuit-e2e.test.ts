import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { poseidon1, poseidon2 } from 'poseidon-lite';

async function getSnarkjs() {
  return await import('snarkjs') as any;
}

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');

function circuitPaths(name: string) {
  return {
    wasm: path.join(CIRCUITS_DIR, name, 'circuit_js', 'circuit.wasm'),
    zkey: path.join(CIRCUITS_DIR, name, 'circuit_test.zkey'),
    vkey: path.join(CIRCUITS_DIR, name, 'test_vkey.json'),
  };
}

async function proveAndVerify(name: string, input: Record<string, string | string[]>) {
  const snarkjs = await getSnarkjs();
  const p = circuitPaths(name);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, p.wasm, p.zkey);
  const vkey = JSON.parse(fs.readFileSync(p.vkey, 'utf-8'));
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  return { valid, publicSignals };
}

async function expectUnsatisfiable(name: string, input: Record<string, string | string[]>) {
  const snarkjs = await getSnarkjs();
  const p = circuitPaths(name);
  await expect(snarkjs.groth16.fullProve(input, p.wasm, p.zkey)).rejects.toThrow();
}

// ============================================================
// anonymous-reputation
// NOTE: meetsThreshold is output-only, no === 1 hard constraint.
//       Circuit has scoreValid===1 (range 0-1000) and validUser===1.
// ============================================================
describe('anonymous-reputation', () => {
  it('VALID: score 80 >= threshold 50 -> meetsThreshold=1', async () => {
    const { valid, publicSignals } = await proveAndVerify('anonymous-reputation', {
      userId: '42',
      reputationScore: '80',
      userNonce: '999',
      thresholdScore: '50',
      platformId: '1',
    });
    expect(valid).toBe(true);
    expect(publicSignals[1]).toBe('1');
  }, 30000);

  it('INVALID: score 30 < threshold 50 -> circuit unsatisfiable (meetsThreshold===1)', async () => {
    await expectUnsatisfiable('anonymous-reputation', {
      userId: '42',
      reputationScore: '30',
      userNonce: '999',
      thresholdScore: '50',
      platformId: '1',
    });
  }, 30000);

  it('INVALID: score out of range (>1000) -> circuit unsatisfiable', async () => {
    await expectUnsatisfiable('anonymous-reputation', {
      userId: '42',
      reputationScore: '1001',
      userNonce: '999',
      thresholdScore: '50',
      platformId: '1',
    });
  }, 30000);

  it('INVALID: userId=0 -> circuit unsatisfiable', async () => {
    await expectUnsatisfiable('anonymous-reputation', {
      userId: '0',
      reputationScore: '80',
      userNonce: '999',
      thresholdScore: '50',
      platformId: '1',
    });
  }, 30000);
});

// ============================================================
// credential-proof
// NOTE: isValid is binary-only (no === 1), expired credential still satisfiable
// ============================================================
describe('credential-proof', () => {
  it('VALID: matching hash, not expired -> isValid=1', async () => {
    // NOTE: circuit compares credentialHash == expectedHash directly (not Poseidon)
    // Poseidon(credentialSecret, validUntil) is used only to prove knowledge of secret
    const credentialHash = BigInt(12345);
    const credentialSecret = BigInt(67890);

    const { valid, publicSignals } = await proveAndVerify('credential-proof', {
      credentialHash: credentialHash.toString(),
      credentialSecret: credentialSecret.toString(),
      validUntil: '2000',
      currentTime: '1000',
      expectedHash: credentialHash.toString(), // must equal credentialHash
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('INVALID: expired credential -> circuit unsatisfiable (isValid===1)', async () => {
    const credentialHash = BigInt(12345);
    const credentialSecret = BigInt(67890);

    await expectUnsatisfiable('credential-proof', {
      credentialHash: credentialHash.toString(),
      credentialSecret: credentialSecret.toString(),
      validUntil: '1000',
      currentTime: '2000',
      expectedHash: credentialHash.toString(),
    });
  }, 30000);
});

// ============================================================
// nft-ownership
// Has validSecret===1 and validToken===1 (range check), but
// no ownership hash hard constraint
// ============================================================
describe('nft-ownership', () => {
  it('VALID: token in range with correct ownership hash', async () => {
    const nftTokenId = BigInt(50);
    const ownerSecret = BigInt(777);
    const ownerHash = poseidon2([nftTokenId, ownerSecret]);
    const collectionRoot = poseidon1([ownerHash]);

    const { valid } = await proveAndVerify('nft-ownership', {
      nftTokenId: nftTokenId.toString(),
      ownerSecret: ownerSecret.toString(),
      collectionRoot: collectionRoot.toString(),
      minTokenId: '1',
      maxTokenId: '100',
    });
    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: token out of range -> circuit unsatisfiable (isValid===1)', async () => {
    const nftTokenId = BigInt(200);
    const ownerSecret = BigInt(777);
    const ownerHash = poseidon2([nftTokenId, ownerSecret]);
    const collectionRoot = poseidon1([ownerHash]);

    await expectUnsatisfiable('nft-ownership', {
      nftTokenId: nftTokenId.toString(),
      ownerSecret: ownerSecret.toString(),
      collectionRoot: collectionRoot.toString(),
      minTokenId: '1',
      maxTokenId: '100',
    });
  }, 30000);
});

// ============================================================
// patience-proof
// NOTE: isValid is binary-only, no === 1
// ============================================================
describe('patience-proof', () => {
  it('VALID: waited 3600s >= minimum 3600s', async () => {
    const startTime = BigInt(1000);
    const secret = BigInt(42);
    const commitmentHash = poseidon2([startTime, secret]);

    const { valid, publicSignals } = await proveAndVerify('patience-proof', {
      startTime: startTime.toString(),
      endTime: '4600',
      secret: secret.toString(),
      minimumWaitTime: '3600',
      commitmentHash: commitmentHash.toString(),
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('INVALID: waited too little -> circuit unsatisfiable (isValid===1)', async () => {
    const startTime = BigInt(1000);
    const secret = BigInt(42);
    const commitmentHash = poseidon2([startTime, secret]);

    await expectUnsatisfiable('patience-proof', {
      startTime: startTime.toString(),
      endTime: '2000',
      secret: secret.toString(),
      minimumWaitTime: '3600',
      commitmentHash: commitmentHash.toString(),
    });
  }, 30000);
});

// ============================================================
// private-voting
// ============================================================
describe('private-voting', () => {
  it('VALID: vote choice 2 for poll 10', async () => {
    const { valid } = await proveAndVerify('private-voting', {
      voterId: '12345',
      voteChoice: '2',
      pollId: '10',
    });
    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: vote choice out of range (>=4)', async () => {
    await expectUnsatisfiable('private-voting', {
      voterId: '12345',
      voteChoice: '5',
      pollId: '10',
    });
  }, 30000);
});

// ============================================================
// range-proof
// ============================================================
describe('range-proof', () => {
  it('VALID: value 50 in range [10, 100]', async () => {
    const { valid, publicSignals } = await proveAndVerify('range-proof', {
      value: '50',
      minRange: '10',
      maxRange: '100',
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('VALID: value at lower boundary', async () => {
    const { valid } = await proveAndVerify('range-proof', {
      value: '10',
      minRange: '10',
      maxRange: '100',
    });
    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: value below range', async () => {
    await expectUnsatisfiable('range-proof', {
      value: '5',
      minRange: '10',
      maxRange: '100',
    });
  }, 30000);

  it('INVALID: value above range', async () => {
    await expectUnsatisfiable('range-proof', {
      value: '101',
      minRange: '10',
      maxRange: '100',
    });
  }, 30000);
});

// ============================================================
// viewing-key-proof
// NOTE: isAuthorized is binary-only, no === 1
// ============================================================
describe('viewing-key-proof', () => {
  it('VALID: correct viewing key hash -> isAuthorized=1', async () => {
    const viewingKey = BigInt(111);
    const salt = BigInt(222);
    const viewingKeyHash = poseidon2([viewingKey, salt]);

    const { valid, publicSignals } = await proveAndVerify('viewing-key-proof', {
      viewingKey: viewingKey.toString(),
      salt: salt.toString(),
      viewingKeyHash: viewingKeyHash.toString(),
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('INVALID: wrong viewing key -> circuit unsatisfiable (isAuthorized===1)', async () => {
    const viewingKey = BigInt(111);
    const salt = BigInt(222);
    const viewingKeyHash = poseidon2([viewingKey, salt]);

    await expectUnsatisfiable('viewing-key-proof', {
      viewingKey: '999',
      salt: salt.toString(),
      viewingKeyHash: viewingKeyHash.toString(),
    });
  }, 30000);
});

// ============================================================
// token-swap (has canSwap === 1 hard constraint)
// ============================================================
describe('token-swap', () => {
  it('VALID: sufficient balance and meets minimum receive', async () => {
    const { valid } = await proveAndVerify('token-swap', {
      tokenABalance: '1000',
      swapSecret: '42',
      requiredTokenA: '500',
      swapRate: '2000',
      minReceive: '800',
    });
    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: insufficient balance', async () => {
    await expectUnsatisfiable('token-swap', {
      tokenABalance: '100',
      swapSecret: '42',
      requiredTokenA: '500',
      swapRate: '2000',
      minReceive: '800',
    });
  }, 30000);

  it('INVALID: minimum receive not met', async () => {
    // product = 500 * 500 = 250,000 < 800 * 1000 = 800,000
    await expectUnsatisfiable('token-swap', {
      tokenABalance: '1000',
      swapSecret: '42',
      requiredTokenA: '500',
      swapRate: '500',
      minReceive: '800',
    });
  }, 30000);
});

// ============================================================
// membership-proof (Merkle tree, depth=16)
// ============================================================
describe('membership-proof', () => {
  const DEPTH = 16;

  function buildMerkleTree(leaves: bigint[]) {
    let zeroHash = poseidon1([BigInt(0)]);
    const zeroHashes: bigint[] = [zeroHash];
    for (let i = 1; i < DEPTH; i++) {
      zeroHash = poseidon2([zeroHash, zeroHash]);
      zeroHashes.push(zeroHash);
    }

    // For a single leaf at index 0: all siblings are zero hashes
    let currentHash = leaves[0];
    const pathElements: string[] = [];
    const pathIndices: string[] = [];

    if (leaves.length === 1) {
      for (let i = 0; i < DEPTH; i++) {
        pathElements.push(zeroHashes[i].toString());
        pathIndices.push('0');
        currentHash = poseidon2([currentHash, zeroHashes[i]]);
      }
    } else {
      // For 2 leaves
      pathElements.push(leaves[1].toString());
      pathIndices.push('0');
      currentHash = poseidon2([leaves[0], leaves[1]]);

      for (let i = 1; i < DEPTH; i++) {
        pathElements.push(zeroHashes[i].toString());
        pathIndices.push('0');
        currentHash = poseidon2([currentHash, zeroHashes[i]]);
      }
    }
    return { root: currentHash, pathElements, pathIndices };
  }

  it('VALID: member in single-leaf Merkle tree', async () => {
    const memberId = BigInt(42);
    const leaf = poseidon1([memberId]);
    const { root, pathElements, pathIndices } = buildMerkleTree([leaf]);

    const { valid, publicSignals } = await proveAndVerify('membership-proof', {
      memberId: memberId.toString(),
      pathElements,
      pathIndices,
      root: root.toString(),
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('INVALID: wrong memberId -> root mismatch', async () => {
    const memberId = BigInt(42);
    const leaf = poseidon1([memberId]);
    const { root, pathElements, pathIndices } = buildMerkleTree([leaf]);

    // Use wrong memberId - the computed leaf hash won't match the tree
    await expectUnsatisfiable('membership-proof', {
      memberId: '999',
      pathElements,
      pathIndices,
      root: root.toString(),
    });
  }, 60000);
});

// ============================================================
// whale-holder (Merkle tree depth=20 + balance check)
// NOTE: hasMinimum has NO hard constraint — output-only
// ============================================================
describe('whale-holder', () => {
  const DEPTH = 20;

  function buildWhaleTree(address: bigint, balance: bigint) {
    const leafHash = poseidon2([address, balance]);

    let zeroHash = poseidon2([BigInt(0), BigInt(0)]);
    const zeroHashes: bigint[] = [zeroHash];
    for (let i = 1; i < DEPTH; i++) {
      zeroHash = poseidon2([zeroHash, zeroHash]);
      zeroHashes.push(zeroHash);
    }

    let currentHash = leafHash;
    const pathElements: string[] = [];
    const pathIndices: string[] = [];
    for (let i = 0; i < DEPTH; i++) {
      pathElements.push(zeroHashes[i].toString());
      pathIndices.push('0');
      currentHash = poseidon2([currentHash, zeroHashes[i]]);
    }
    return { root: currentHash, pathElements, pathIndices };
  }

  it('VALID: whale 15M >= 10M minimum -> hasMinimum=1', async () => {
    const address = BigInt(123456789);
    const balance = BigInt(15000000);
    const { root, pathElements, pathIndices } = buildWhaleTree(address, balance);

    const { valid, publicSignals } = await proveAndVerify('whale-holder', {
      address: address.toString(),
      balance: balance.toString(),
      pathElements,
      pathIndices,
      nullifierSecret: '42',
      root: root.toString(),
      minimumBalance: '10000000',
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('INVALID: balance 5M < 10M minimum -> circuit unsatisfiable (hasMinimum===1)', async () => {
    const address = BigInt(123456789);
    const balance = BigInt(5000000);
    const { root, pathElements, pathIndices } = buildWhaleTree(address, balance);

    await expectUnsatisfiable('whale-holder', {
      address: address.toString(),
      balance: balance.toString(),
      pathElements,
      pathIndices,
      nullifierSecret: '42',
      root: root.toString(),
      minimumBalance: '10000000',
    });
  }, 60000);

  it('INVALID: wrong root -> circuit unsatisfiable', async () => {
    const address = BigInt(123456789);
    const balance = BigInt(15000000);
    const { pathElements, pathIndices } = buildWhaleTree(address, balance);

    await expectUnsatisfiable('whale-holder', {
      address: address.toString(),
      balance: balance.toString(),
      pathElements,
      pathIndices,
      nullifierSecret: '42',
      root: '999', // wrong root
      minimumBalance: '10000000',
    });
  }, 60000);
});
