/**
 * zkRune Mobile - Solana On-Chain Proof Verifier
 * Submits Groth16 ZK proofs to the deployed Solana verifier program
 */

import { Buffer } from 'buffer';
import { solanaRpc } from './solanaRpc';
import { walletService, WalletProvider } from './walletService';
import type { ProofResult, ProofType } from './zkProofService';

const VERIFIER_PROGRAM_ID = '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad';

const BN254_PRIME = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');

const TEMPLATE_ID_MAP: Record<string, number> = {
  'age-verification': 0,
  'balance-proof': 1,
  'membership-proof': 2,
  'credential-proof': 3,
  'private-voting': 4,
  'nft-ownership': 5,
  'range-proof': 6,
  'hash-preimage': 7,
  'quadratic-voting': 8,
  'anonymous-reputation': 9,
  'token-swap': 10,
  'patience-proof': 11,
  'signature-verification': 12,
};

function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xFF));
    n >>= BigInt(8);
  }
  return bytes;
}

function negateG1(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === BigInt(0) ? BigInt(0) : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

function g1ToBytes(point: string[]): Uint8Array {
  const result = new Uint8Array(64);
  result.set(fieldToBytes(point[0]), 0);
  result.set(fieldToBytes(point[1]), 32);
  return result;
}

/**
 * snarkjs: [[x.c1, x.c0], [y.c1, y.c0]]
 * Output: [x.c0 BE, x.c1 BE, y.c0 BE, y.c1 BE]
 */
function g2ToBytes(point: string[][]): Uint8Array {
  const result = new Uint8Array(128);
  result.set(fieldToBytes(point[0][1]), 0);
  result.set(fieldToBytes(point[0][0]), 32);
  result.set(fieldToBytes(point[1][1]), 64);
  result.set(fieldToBytes(point[1][0]), 96);
  return result;
}

function serializeProofInstruction(
  templateId: number,
  proof: any,
  publicSignals: string[]
): Uint8Array {
  const size = 1 + 64 + 128 + 64 + (publicSignals.length * 32);
  const data = new Uint8Array(size);
  let offset = 0;

  data[offset] = templateId;
  offset += 1;

  const negatedA = negateG1(proof.pi_a);
  data.set(g1ToBytes(negatedA), offset);
  offset += 64;

  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;

  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;

  for (const signal of publicSignals) {
    data.set(fieldToBytes(signal), offset);
    offset += 32;
  }

  return data;
}

export interface VerifyOnChainResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Build a raw Solana transaction for proof verification.
 * Uses compact transaction format compatible with Solana RPC.
 */
async function buildVerifyTransaction(
  payerPublicKey: Uint8Array,
  instructionData: Uint8Array,
  recentBlockhash: string
): Promise<Uint8Array> {
  const bs58 = (await import('bs58')).default;
  const programIdBytes = bs58.decode(VERIFIER_PROGRAM_ID);

  // Solana transaction format (legacy):
  // [num_signatures(1)][signature(64)][message]
  // message: [header(3)][account_keys][blockhash(32)][instructions]
  
  // Header: num_required_signatures=1, num_readonly_signed=0, num_readonly_unsigned=1
  const header = new Uint8Array([1, 0, 1]);
  
  // Account keys: [payer, program_id]
  const numAccounts = 2;
  
  // Blockhash
  const blockhashBytes = bs58.decode(recentBlockhash);
  
  // Instruction: program_id_index=1, no accounts, data
  const instructionProgramIdx = 1;
  const numInstructionAccounts = 0;
  
  // Encode data length as compact-u16
  const dataLenEncoded = encodeCompactU16(instructionData.length);
  
  // Build message
  const messageParts: Uint8Array[] = [
    header,
    new Uint8Array([numAccounts]),
    payerPublicKey,
    programIdBytes,
    blockhashBytes,
    new Uint8Array([1]), // num_instructions = 1
    new Uint8Array([instructionProgramIdx]),
    new Uint8Array([numInstructionAccounts]),
    dataLenEncoded,
    instructionData,
  ];
  
  let messageLen = 0;
  for (const part of messageParts) messageLen += part.length;
  
  const message = new Uint8Array(messageLen);
  let pos = 0;
  for (const part of messageParts) {
    message.set(part, pos);
    pos += part.length;
  }
  
  return message;
}

function encodeCompactU16(value: number): Uint8Array {
  if (value < 0x80) {
    return new Uint8Array([value]);
  } else if (value < 0x4000) {
    return new Uint8Array([
      (value & 0x7F) | 0x80,
      (value >> 7) & 0x7F,
    ]);
  } else {
    return new Uint8Array([
      (value & 0x7F) | 0x80,
      ((value >> 7) & 0x7F) | 0x80,
      (value >> 14) & 0x03,
    ]);
  }
}

/**
 * Verify a ZK proof on-chain using the Solana Groth16 verifier program.
 * Only works with native wallets (local signing).
 */
export async function verifyProofOnChain(
  proofResult: ProofResult
): Promise<VerifyOnChainResult> {
  try {
    const connection = await walletService.getConnection();
    if (!connection) {
      return { success: false, error: 'No wallet connected' };
    }

    if (connection.provider !== WalletProvider.NATIVE) {
      return { 
        success: false, 
        error: 'On-chain verification requires a native zkRune wallet. External wallets (Phantom/Solflare) are not yet supported for mobile signing.' 
      };
    }

    const templateId = TEMPLATE_ID_MAP[proofResult.type];
    if (templateId === undefined) {
      return { success: false, error: `Unsupported proof type: ${proofResult.type}` };
    }

    if (!proofResult.proof?.pi_a || !proofResult.proof?.pi_b || !proofResult.proof?.pi_c) {
      return { success: false, error: 'Invalid proof data' };
    }

    if (!proofResult.publicSignals || proofResult.publicSignals.length === 0) {
      return { success: false, error: 'No public signals in proof' };
    }

    const keypair = await walletService.getKeypair();
    if (!keypair) {
      return { success: false, error: 'Could not load wallet keypair' };
    }

    const blockhash = await solanaRpc.getRecentBlockhash();
    if (!blockhash) {
      return { success: false, error: 'Failed to get recent blockhash. Check your network connection.' };
    }

    const instructionData = serializeProofInstruction(
      templateId,
      proofResult.proof,
      proofResult.publicSignals
    );

    console.log(`[SolanaVerifier] Verifying ${proofResult.type} (template ${templateId}), instruction size: ${instructionData.length} bytes`);

    const message = await buildVerifyTransaction(
      keypair.publicKey.toBytes(),
      instructionData,
      blockhash
    );

    const nacl = (await import('tweetnacl')).default;
    const signature = nacl.sign.detached(message, keypair.secretKey);

    // Build signed transaction: [num_sigs][sig][message]
    const signedTx = new Uint8Array(1 + 64 + message.length);
    signedTx[0] = 1;
    signedTx.set(signature, 1);
    signedTx.set(message, 65);

    const txBase64 = Buffer.from(signedTx).toString('base64');

    const txSignature = await solanaRpc.sendTransaction(txBase64);
    if (!txSignature) {
      return { success: false, error: 'Transaction failed. The proof may be invalid or you may have insufficient SOL for fees.' };
    }

    console.log(`[SolanaVerifier] Transaction sent: ${txSignature}`);

    const explorerUrl = `https://solscan.io/tx/${txSignature}`;

    return {
      success: true,
      signature: txSignature,
      explorerUrl,
    };
  } catch (error: any) {
    console.error('[SolanaVerifier] Verification failed:', error);

    let errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('ProofVerificationFailed')) {
      errorMessage = 'Proof verification failed on-chain. Please regenerate the proof.';
    } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('Insufficient')) {
      errorMessage = 'Insufficient SOL for transaction fees.';
    }

    return { success: false, error: errorMessage };
  }
}

export function isTemplateSupported(proofType: ProofType): boolean {
  return proofType in TEMPLATE_ID_MAP;
}

export function getExplorerUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}
