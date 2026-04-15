import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram 
} from '@solana/web3.js';
import { PROGRAM_IDS, getSolscanUrl } from '@/lib/solana/config';
import { serializeProof } from '@/lib/solana/proofSerializer';

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
  [key: string]: unknown;
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

// serializeProof is re-exported from the shared module below so existing
// imports (`import { serializeProof } from '@/lib/hooks/useOnChainVerify'`)
// keep working during the migration.
export { serializeProof };

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
