/**
 * Test script for snarkjs → Solana converter
 * Run with: npx ts-node lib/solana/converter.test.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  fieldToBytes,
  g1ToBytes,
  g2ToBytes,
  negateG1,
  convertVKForSolana,
  convertProofForSolana,
  convertPublicInputs,
  bytesToHex,
  generateRustVK,
} from './converter';

// BN254 prime for reference
const BN254_PRIME = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');

console.log('='.repeat(60));
console.log('zkRune - Solana Converter Test Suite');
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => boolean) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name} - returned false`);
      testsFailed++;
    }
  } catch (error: any) {
    console.log(`❌ ${name} - ${error.message}`);
    testsFailed++;
  }
}

// ============================================
// Test 1: fieldToBytes
// ============================================
console.log('\n--- Test: fieldToBytes ---');

test('fieldToBytes returns 32 bytes', () => {
  const result = fieldToBytes('12345678901234567890');
  return result.length === 32;
});

test('fieldToBytes zero', () => {
  const result = fieldToBytes('0');
  return result.length === 32 && result.every(b => b === 0);
});

test('fieldToBytes big number', () => {
  // A typical field element from snarkjs
  const input = '20491192805390485299153009773594534940189261866228447918068658471970481763042';
  const result = fieldToBytes(input);
  return result.length === 32;
});

test('fieldToBytes handles modular reduction', () => {
  // Number larger than prime should be reduced
  const bigNum = (BN254_PRIME + BigInt(1)).toString();
  const result = fieldToBytes(bigNum);
  // Should equal fieldToBytes("1")
  const one = fieldToBytes('1');
  return bytesToHex(result) === bytesToHex(one);
});

// ============================================
// Test 2: g1ToBytes
// ============================================
console.log('\n--- Test: g1ToBytes ---');

test('g1ToBytes returns 64 bytes', () => {
  const point = ['123', '456', '1'];
  const result = g1ToBytes(point);
  return result.length === 64;
});

test('g1ToBytes with real VK point', () => {
  // From age-verification VK
  const point = [
    '20491192805390485299153009773594534940189261866228447918068658471970481763042',
    '9383485363053290200918347156157836566562967994039712273449902621266178545958',
    '1'
  ];
  const result = g1ToBytes(point);
  return result.length === 64;
});

// ============================================
// Test 3: negateG1
// ============================================
console.log('\n--- Test: negateG1 ---');

test('negateG1 produces valid output', () => {
  const point = ['123', '456', '1'];
  const negated = negateG1(point);
  return negated.length === 2 && BigInt(negated[1]) === BN254_PRIME - BigInt(456);
});

test('negateG1 zero stays zero', () => {
  const point = ['123', '0', '1'];
  const negated = negateG1(point);
  return negated[1] === '0';
});

test('negateG1 double negation returns original', () => {
  const original = ['123', '456', '1'];
  const negated = negateG1(original);
  const doubleNegated = negateG1(negated);
  return doubleNegated[1] === original[1];
});

// ============================================
// Test 4: g2ToBytes
// ============================================
console.log('\n--- Test: g2ToBytes ---');

test('g2ToBytes returns 128 bytes', () => {
  const point = [
    ['100', '200'],
    ['300', '400'],
    ['1', '0']
  ];
  const result = g2ToBytes(point);
  return result.length === 128;
});

test('g2ToBytes swaps c0/c1 correctly', () => {
  // snarkjs gives [c1, c0], we want [c0, c1]
  const point = [
    ['111', '222'], // x: c1=111, c0=222
    ['333', '444'], // y: c1=333, c0=444
    ['1', '0']
  ];
  const result = g2ToBytes(point);
  
  // First 32 bytes should be x_c0 = 222
  const x_c0 = fieldToBytes('222');
  const first32 = result.slice(0, 32);
  
  return bytesToHex(first32) === bytesToHex(x_c0);
});

// ============================================
// Test 5: Load and convert real VK
// ============================================
console.log('\n--- Test: Real VK Conversion ---');

const vkPath = path.join(__dirname, '../../circuits/age-verification/verification_key.json');

test('Load age-verification VK', () => {
  return fs.existsSync(vkPath);
});

let realVK: any;
let solanaVK: any;

test('Parse VK JSON', () => {
  const content = fs.readFileSync(vkPath, 'utf-8');
  realVK = JSON.parse(content);
  return realVK.protocol === 'groth16' && realVK.curve === 'bn128';
});

test('Convert VK to Solana format', () => {
  solanaVK = convertVKForSolana(realVK);
  return solanaVK !== null;
});

test('VK alpha_g1 is 64 bytes', () => {
  return solanaVK.vk_alpha_g1.length === 64;
});

test('VK beta_g2 is 128 bytes', () => {
  return solanaVK.vk_beta_g2.length === 128;
});

test('VK gamma_g2 is 128 bytes', () => {
  return solanaVK.vk_gamma_g2.length === 128;
});

test('VK delta_g2 is 128 bytes', () => {
  return solanaVK.vk_delta_g2.length === 128;
});

test(`VK has ${realVK?.IC?.length || 0} IC points`, () => {
  return solanaVK.vk_ic.length === realVK.IC.length;
});

test('Each IC point is 64 bytes', () => {
  return solanaVK.vk_ic.every((ic: Uint8Array) => ic.length === 64);
});

test('nPublic matches', () => {
  return solanaVK.nPublic === realVK.nPublic;
});

// ============================================
// Test 6: Generate Rust code
// ============================================
console.log('\n--- Test: Rust Code Generation ---');

test('Generate Rust VK code', () => {
  const rustCode = generateRustVK(solanaVK, 'AGE_VERIFICATION');
  return rustCode.includes('AGE_VERIFICATION_VK_ALPHA_G1') &&
         rustCode.includes('AGE_VERIFICATION_VK_BETA_G2') &&
         rustCode.includes('AGE_VERIFICATION_VK_IC');
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log(`Tests: ${testsPassed} passed, ${testsFailed} failed`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
}

// Print sample output
console.log('\n--- Sample Output: VK Alpha G1 (first 32 bytes as hex) ---');
console.log(bytesToHex(solanaVK.vk_alpha_g1.slice(0, 32)));

console.log('\n--- VK Sizes Summary ---');
console.log(`alpha_g1: ${solanaVK.vk_alpha_g1.length} bytes`);
console.log(`beta_g2:  ${solanaVK.vk_beta_g2.length} bytes`);
console.log(`gamma_g2: ${solanaVK.vk_gamma_g2.length} bytes`);
console.log(`delta_g2: ${solanaVK.vk_delta_g2.length} bytes`);
console.log(`IC count: ${solanaVK.vk_ic.length} (each 64 bytes)`);
console.log(`nPublic:  ${solanaVK.nPublic}`);

// ============================================
// Test 7: Proof Conversion (with mock proof)
// ============================================
console.log('\n--- Test: Proof Conversion ---');

// Mock proof in snarkjs format (structure matches real proofs)
const mockProof = {
  pi_a: [
    '19526881493540892752816648163284956849897167176881124198697564418619398440692',
    '10383149580706044986947369003891574400167126684256368528495857888064075649017',
    '1'
  ],
  pi_b: [
    [
      '6375614351688725206403948262868962793625744043794305715222011528459656738731',
      '4252822878758300859123897981450591353533073413197771768651442665752259397132'
    ],
    [
      '10505242626370262277552901082094356697409835680220590971873171140371331206856',
      '21847035105528745403288232691147584728191162732299865338377159692350059136679'
    ],
    ['1', '0']
  ],
  pi_c: [
    '8839290076123176540917309009796498275652498264052772042541802342446512568347',
    '13651936328042233605011324338900188279495023046563581509836941908445613806653',
    '1'
  ]
};

test('Convert mock proof to Solana format', () => {
  const solanaProof = convertProofForSolana(mockProof);
  return solanaProof !== null;
});

test('proof_a is 64 bytes', () => {
  const solanaProof = convertProofForSolana(mockProof);
  return solanaProof.proof_a.length === 64;
});

test('proof_b is 128 bytes', () => {
  const solanaProof = convertProofForSolana(mockProof);
  return solanaProof.proof_b.length === 128;
});

test('proof_c is 64 bytes', () => {
  const solanaProof = convertProofForSolana(mockProof);
  return solanaProof.proof_c.length === 64;
});

test('combined proof is 256 bytes', () => {
  const solanaProof = convertProofForSolana(mockProof);
  return solanaProof.combined.length === 256;
});

test('proof_a is negated (y coordinate changed)', () => {
  const solanaProof = convertProofForSolana(mockProof);
  // Original y: 10383149580706044986947369003891574400167126684256368528495857888064075649017
  // After negation it should be different
  const originalY = fieldToBytes(mockProof.pi_a[1]);
  const proofAY = solanaProof.proof_a.slice(32, 64);
  // They should NOT be equal (negation applied)
  return bytesToHex(originalY) !== bytesToHex(proofAY);
});

// ============================================
// Test 8: Public Inputs Conversion
// ============================================
console.log('\n--- Test: Public Inputs Conversion ---');

const mockPublicSignals = ['1', '1717023600', '1893456000'];

test('Convert public inputs', () => {
  const inputs = convertPublicInputs(mockPublicSignals);
  return inputs.length === 3;
});

test('Each public input is 32 bytes', () => {
  const inputs = convertPublicInputs(mockPublicSignals);
  return inputs.every(input => input.length === 32);
});

// ============================================
// Final Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log(`FINAL: ${testsPassed} passed, ${testsFailed} failed`);
console.log('='.repeat(60));

// Proof sizes summary
const finalProof = convertProofForSolana(mockProof);
console.log('\n--- Proof Sizes Summary ---');
console.log(`proof_a:  ${finalProof.proof_a.length} bytes`);
console.log(`proof_b:  ${finalProof.proof_b.length} bytes`);
console.log(`proof_c:  ${finalProof.proof_c.length} bytes`);
console.log(`combined: ${finalProof.combined.length} bytes`);
