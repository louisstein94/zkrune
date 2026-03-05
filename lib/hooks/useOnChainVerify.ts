import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram 
} from '@solana/web3.js';
import { PROGRAM_IDS, getSolscanUrl } from '@/lib/solana/config';

interface VerificationResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

interface ProofData {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

interface OnChainVerifyState {
  isVerifying: boolean;
  result: VerificationResult | null;
  error: string | null;
}

// Template IDs for on-chain verification
export const TEMPLATE_IDS: Record<string, number> = {
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

// BN254 curve prime field modulus (for negation)
const BN254_PRIME = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');

/**
 * Convert a decimal string to a 32-byte big-endian array
 */
function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n = n >> BigInt(8);
  }
  return bytes;
}

/**
 * Negate G1 point y-coordinate: (x, y) → (x, p - y)
 */
function negateG1(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === BigInt(0) ? BigInt(0) : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

/**
 * Convert G1 point to 64 bytes (Light Protocol format: direct BE)
 */
function g1ToBytes(point: string[]): Uint8Array {
  const result = new Uint8Array(64);
  result.set(fieldToBytes(point[0]), 0);  // x BE
  result.set(fieldToBytes(point[1]), 32); // y BE
  return result;
}

/**
 * Convert G2 point to 128 bytes (Light Protocol format)
 * snarkjs format: [[x.c1, x.c0], [y.c1, y.c0]]
 * Output: [x.c0 BE, x.c1 BE, y.c0 BE, y.c1 BE]
 */
function g2ToBytes(point: string[][]): Uint8Array {
  const result = new Uint8Array(128);
  // snarkjs: point[0] = [x.c1, x.c0], point[1] = [y.c1, y.c0]
  result.set(fieldToBytes(point[0][1]), 0);   // x.c0 BE
  result.set(fieldToBytes(point[0][0]), 32);  // x.c1 BE
  result.set(fieldToBytes(point[1][1]), 64);  // y.c0 BE
  result.set(fieldToBytes(point[1][0]), 96);  // y.c1 BE
  return result;
}

/**
 * Serialize proof for on-chain verification (Light Protocol format)
 * - proof_a: NEGATED, then converted to bytes
 * - proof_b: G2 in [c0 BE, c1 BE] order
 * - proof_c: G1 direct BE
 */
export function serializeProof(
  templateId: number,
  proof: ProofData,
  publicInputs: string[]
): Uint8Array {
  // Calculate total size
  // 1 byte template ID + 64 bytes proof_a + 128 bytes proof_b + 64 bytes proof_c + (n * 32) bytes public inputs
  const size = 1 + 64 + 128 + 64 + (publicInputs.length * 32);
  const data = new Uint8Array(size);
  
  let offset = 0;
  
  // Template ID (1 byte)
  data[offset] = templateId;
  offset += 1;
  
  // Proof A (64 bytes - G1 point, NEGATED)
  const negatedA = negateG1(proof.pi_a);
  data.set(g1ToBytes(negatedA), offset);
  offset += 64;
  
  // Proof B (128 bytes - G2 point)
  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;
  
  // Proof C (64 bytes - G1 point)
  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;
  
  // Public inputs (n * 32 bytes, big-endian)
  for (const input of publicInputs) {
    data.set(fieldToBytes(input), offset);
    offset += 32;
  }
  
  return data;
}

export function useOnChainVerify() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<OnChainVerifyState>({
    isVerifying: false,
    result: null,
    error: null,
  });

  const verifyOnChain = useCallback(async (
    templateId: string,
    proof: ProofData,
    publicInputs: string[]
  ): Promise<VerificationResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    const programId = PROGRAM_IDS.GROTH16_VERIFIER;
    if (!programId) {
      return { success: false, error: 'Verifier program not configured' };
    }

    const templateIdNum = TEMPLATE_IDS[templateId];
    if (templateIdNum === undefined) {
      return { success: false, error: `Unknown template: ${templateId}` };
    }

    setState({ isVerifying: true, result: null, error: null });

    try {
      // Serialize proof data
      const instructionData = serializeProof(templateIdNum, proof, publicInputs);
      
      console.log('Sending on-chain verification...');
      console.log('Program ID:', programId);
      console.log('Template ID:', templateIdNum);
      console.log('Instruction data size:', instructionData.length, 'bytes');

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
        ],
        programId: new PublicKey(programId),
        data: Buffer.from(instructionData),
      });

      // Create transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Transaction sent:', signature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      const result: VerificationResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
      };

      setState({ isVerifying: false, result, error: null });
      return result;

    } catch (error: any) {
      console.error('On-chain verification failed:', error);
      const errorMessage = error.message || 'Unknown error';
      
      const result: VerificationResult = {
        success: false,
        error: errorMessage,
      };

      setState({ isVerifying: false, result, error: errorMessage });
      return result;
    }
  }, [publicKey, connection, sendTransaction]);

  const reset = useCallback(() => {
    setState({ isVerifying: false, result: null, error: null });
  }, []);

  return {
    verifyOnChain,
    isVerifying: state.isVerifying,
    result: state.result,
    error: state.error,
    reset,
  };
}
