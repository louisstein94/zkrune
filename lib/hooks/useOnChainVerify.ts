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

/**
 * Convert a hex string or bigint string to a 32-byte array
 */
function toBigEndianBytes(value: string): Uint8Array {
  // Remove 0x prefix if present
  const cleanHex = value.startsWith('0x') ? value.slice(2) : value;
  
  // Convert to bigint if it's a decimal string
  let bigintValue: bigint;
  if (/^[0-9]+$/.test(cleanHex)) {
    bigintValue = BigInt(cleanHex);
  } else {
    bigintValue = BigInt('0x' + cleanHex);
  }
  
  // Convert to 32-byte big-endian array
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(bigintValue & BigInt(0xff));
    bigintValue = bigintValue >> BigInt(8);
  }
  return bytes;
}

/**
 * Convert G1 point (2 field elements) to 64 bytes
 */
function g1ToBytes(point: string[]): Uint8Array {
  const result = new Uint8Array(64);
  result.set(toBigEndianBytes(point[0]), 0);
  result.set(toBigEndianBytes(point[1]), 32);
  return result;
}

/**
 * Convert G2 point (2x2 field elements) to 128 bytes
 */
function g2ToBytes(point: string[][]): Uint8Array {
  const result = new Uint8Array(128);
  // G2 points in snarkjs are [[[x0, x1], [y0, y1]]]
  result.set(toBigEndianBytes(point[0][0]), 0);
  result.set(toBigEndianBytes(point[0][1]), 32);
  result.set(toBigEndianBytes(point[1][0]), 64);
  result.set(toBigEndianBytes(point[1][1]), 96);
  return result;
}

/**
 * Serialize proof for on-chain verification
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
  
  // Proof A (64 bytes - G1 point)
  data.set(g1ToBytes(proof.pi_a), offset);
  offset += 64;
  
  // Proof B (128 bytes - G2 point)
  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;
  
  // Proof C (64 bytes - G1 point)
  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;
  
  // Public inputs (n * 32 bytes)
  for (const input of publicInputs) {
    data.set(toBigEndianBytes(input), offset);
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
