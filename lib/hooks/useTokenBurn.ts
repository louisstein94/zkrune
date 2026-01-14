import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createBurnInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { ZKRUNE_TOKEN_CONFIG, getSolscanUrl } from '@/lib/solana/config';

interface BurnResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  amountBurned?: number;
  error?: string;
}

interface TokenBurnState {
  isBurning: boolean;
  result: BurnResult | null;
  error: string | null;
}

export function useTokenBurn() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<TokenBurnState>({
    isBurning: false,
    result: null,
    error: null,
  });

  /**
   * Burn zkRUNE tokens
   * @param amount - Amount of tokens to burn (in UI units, not raw)
   */
  const burnTokens = useCallback(async (amount: number): Promise<BurnResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    setState({ isBurning: true, result: null, error: null });

    try {
      const mintAddress = new PublicKey(ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS);
      const decimals = ZKRUNE_TOKEN_CONFIG.DECIMALS;
      
      // Convert UI amount to raw amount
      const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));
      
      // Get user's associated token account
      const userTokenAccount = getAssociatedTokenAddressSync(
        mintAddress,
        publicKey
      );

      console.log('Burning tokens...');
      console.log('Mint:', mintAddress.toBase58());
      console.log('Token Account:', userTokenAccount.toBase58());
      console.log('Amount (raw):', rawAmount.toString());
      console.log('Amount (UI):', amount);

      // Check token balance first
      const tokenAccountInfo = await connection.getParsedAccountInfo(userTokenAccount);
      
      if (!tokenAccountInfo.value) {
        throw new Error('Token account not found. You may not have any zkRUNE tokens.');
      }

      const accountData = tokenAccountInfo.value.data as any;
      const currentBalance = accountData.parsed?.info?.tokenAmount?.uiAmount || 0;
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient balance. You have ${currentBalance} zkRUNE but tried to burn ${amount}.`);
      }

      // Create burn instruction
      const burnInstruction = createBurnInstruction(
        userTokenAccount,  // Token account to burn from
        mintAddress,       // Mint address
        publicKey,         // Owner of the token account
        rawAmount,         // Amount to burn (raw)
        [],                // Multi-signers (none)
        TOKEN_PROGRAM_ID   // Token program
      );

      // Create transaction
      const transaction = new Transaction().add(burnInstruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Burn transaction sent:', signature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      console.log('Burn confirmed!');

      const result: BurnResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
        amountBurned: amount,
      };

      setState({ isBurning: false, result, error: null });
      return result;

    } catch (error: any) {
      console.error('Token burn failed:', error);
      const errorMessage = error.message || 'Unknown error';
      
      const result: BurnResult = {
        success: false,
        error: errorMessage,
      };

      setState({ isBurning: false, result, error: errorMessage });
      return result;
    }
  }, [publicKey, connection, sendTransaction]);

  /**
   * Get current token balance
   */
  const getBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0;

    try {
      const mintAddress = new PublicKey(ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS);
      const userTokenAccount = getAssociatedTokenAddressSync(mintAddress, publicKey);
      
      const tokenAccountInfo = await connection.getParsedAccountInfo(userTokenAccount);
      
      if (!tokenAccountInfo.value) return 0;
      
      const accountData = tokenAccountInfo.value.data as any;
      return accountData.parsed?.info?.tokenAmount?.uiAmount || 0;
    } catch {
      return 0;
    }
  }, [publicKey, connection]);

  const reset = useCallback(() => {
    setState({ isBurning: false, result: null, error: null });
  }, []);

  return {
    burnTokens,
    getBalance,
    isBurning: state.isBurning,
    result: state.result,
    error: state.error,
    reset,
  };
}
