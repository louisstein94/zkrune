import { describe, it, expect } from 'vitest';
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
} from '../lib/solana/converter';

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

describe('fieldToBytes', () => {
  it('returns 32 bytes', () => {
    expect(fieldToBytes('12345678901234567890').length).toBe(32);
  });

  it('zero produces all-zero bytes', () => {
    const result = fieldToBytes('0');
    expect(result.length).toBe(32);
    expect(result.every((b) => b === 0)).toBe(true);
  });

  it('handles typical field element', () => {
    const input =
      '20491192805390485299153009773594534940189261866228447918068658471970481763042';
    expect(fieldToBytes(input).length).toBe(32);
  });

  it('reduces values larger than prime', () => {
    const bigNum = (BN254_PRIME + BigInt(1)).toString();
    const result = fieldToBytes(bigNum);
    const one = fieldToBytes('1');
    expect(bytesToHex(result)).toBe(bytesToHex(one));
  });
});

describe('g1ToBytes', () => {
  it('returns 64 bytes', () => {
    expect(g1ToBytes(['123', '456', '1']).length).toBe(64);
  });

  it('handles real VK point', () => {
    const point = [
      '20491192805390485299153009773594534940189261866228447918068658471970481763042',
      '9383485363053290200918347156157836566562967994039712273449902621266178545958',
      '1',
    ];
    expect(g1ToBytes(point).length).toBe(64);
  });
});

describe('negateG1', () => {
  it('negates y coordinate correctly', () => {
    const negated = negateG1(['123', '456', '1']);
    expect(negated.length).toBe(2);
    expect(BigInt(negated[1])).toBe(BN254_PRIME - BigInt(456));
  });

  it('zero y stays zero', () => {
    const negated = negateG1(['123', '0', '1']);
    expect(negated[1]).toBe('0');
  });

  it('double negation returns original', () => {
    const original = ['123', '456', '1'];
    const negated = negateG1(original);
    const doubleNegated = negateG1(negated);
    expect(doubleNegated[1]).toBe(original[1]);
  });
});

describe('g2ToBytes', () => {
  it('returns 128 bytes', () => {
    const point = [
      ['100', '200'],
      ['300', '400'],
      ['1', '0'],
    ];
    expect(g2ToBytes(point).length).toBe(128);
  });

  it('produces deterministic 128-byte output', () => {
    const point = [
      ['111', '222'],
      ['333', '444'],
      ['1', '0'],
    ];
    const result1 = g2ToBytes(point);
    const result2 = g2ToBytes(point);
    expect(bytesToHex(result1)).toBe(bytesToHex(result2));
  });
});

describe('Real VK Conversion', () => {
  const vkPath = path.join(
    __dirname,
    '..',
    'circuits',
    'age-verification',
    'verification_key.json',
  );

  it('loads and parses age-verification VK', () => {
    expect(fs.existsSync(vkPath)).toBe(true);
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    expect(vk.protocol).toBe('groth16');
    expect(vk.curve).toBe('bn128');
  });

  it('converts VK to Solana format with correct sizes', () => {
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf-8'));
    const solanaVK = convertVKForSolana(vk);

    expect(solanaVK.vk_alpha_g1.length).toBe(64);
    expect(solanaVK.vk_beta_g2.length).toBe(128);
    expect(solanaVK.vk_gamma_g2.length).toBe(128);
    expect(solanaVK.vk_delta_g2.length).toBe(128);
    expect(solanaVK.vk_ic.length).toBe(vk.IC.length);
    expect(solanaVK.vk_ic.every((ic: Uint8Array) => ic.length === 64)).toBe(true);
    expect(solanaVK.nPublic).toBe(vk.nPublic);
  });
});

describe('Proof Conversion', () => {
  const mockProof = {
    pi_a: [
      '19526881493540892752816648163284956849897167176881124198697564418619398440692',
      '10383149580706044986947369003891574400167126684256368528495857888064075649017',
      '1',
    ],
    pi_b: [
      [
        '6375614351688725206403948262868962793625744043794305715222011528459656738731',
        '4252822878758300859123897981450591353533073413197771768651442665752259397132',
      ],
      [
        '10505242626370262277552901082094356697409835680220590971873171140371331206856',
        '21847035105528745403288232691147584728191162732299865338377159692350059136679',
      ],
      ['1', '0'],
    ],
    pi_c: [
      '8839290076123176540917309009796498275652498264052772042541802342446512568347',
      '13651936328042233605011324338900188279495023046563581509836941908445613806653',
      '1',
    ],
  };

  it('converts proof with correct sizes', () => {
    const solanaProof = convertProofForSolana(mockProof);
    expect(solanaProof.proof_a.length).toBe(64);
    expect(solanaProof.proof_b.length).toBe(128);
    expect(solanaProof.proof_c.length).toBe(64);
    expect(solanaProof.combined.length).toBe(256);
  });

  it('negates proof_a y coordinate', () => {
    const solanaProof = convertProofForSolana(mockProof);
    const originalY = fieldToBytes(mockProof.pi_a[1]);
    const proofAY = solanaProof.proof_a.slice(32, 64);
    expect(bytesToHex(originalY)).not.toBe(bytesToHex(proofAY));
  });
});

describe('Public Inputs Conversion', () => {
  it('converts signals to 32-byte arrays', () => {
    const signals = ['1', '1717023600', '1893456000'];
    const inputs = convertPublicInputs(signals);
    expect(inputs.length).toBe(3);
    expect(inputs.every((i) => i.length === 32)).toBe(true);
  });
});
