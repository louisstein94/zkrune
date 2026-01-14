import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { ZKRUNE_TOKEN_CONFIG, getSolscanUrl } from '@/lib/solana/config';

// Staking vault address (this should be a PDA or multisig in production)
// For now, using a designated vault address
const STAKING_VAULT = process.env.NEXT_PUBLIC_STAKING_VAULT || '';

interface StakeResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  amount?: number;
  error?: string;
}

interface UnstakeResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  amount?: number;
  error?: string;
}

interface StakingOnChainState {
  isStaking: boolean;
  isUnstaking: boolean;
  result: StakeResult | UnstakeResult | null;
  error: string | null;
}

export function useStakingOnChain() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<StakingOnChainState>({
    isStaking: false,
    isUnstaking: false,
    result: null,
    error: null,
  });

  /**
   * Check if staking vault is configured
   */
  const isVaultConfigured = useCallback((): boolean => {
    return Boolean(STAKING_VAULT && STAKING_VAULT.length > 0);
  }, []);

  /**
   * Stake zkRUNE tokens
   * Transfers tokens to the staking vault
   * @param amount - Amount of tokens to stake (in UI units)
   */
  const stakeTokens = useCallback(async (amount: number): Promise<StakeResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!isVaultConfigured()) {
      // Fall back to simulated staking if vault not configured
      console.log('Staking vault not configured, using simulated staking');
      return { 
        success: true, 
        amount,
        signature: 'simulated-' + Date.now(),
      };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    setState(prev => ({ ...prev, isStaking: true, result: null, error: null }));

    try {
      const mintAddress = new PublicKey(ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS);
      const vaultAddress = new PublicKey(STAKING_VAULT);
      const decimals = ZKRUNE_TOKEN_CONFIG.DECIMALS;
      
      // Convert UI amount to raw amount
      const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));
      
      // Get user's token account
      const userTokenAccount = getAssociatedTokenAddressSync(
        mintAddress,
        publicKey
      );

      // Get vault's token account
      const vaultTokenAccount = getAssociatedTokenAddressSync(
        mintAddress,
        vaultAddress
      );

      console.log('Staking tokens...');
      console.log('User Token Account:', userTokenAccount.toBase58());
      console.log('Vault Token Account:', vaultTokenAccount.toBase58());
      console.log('Amount (raw):', rawAmount.toString());

      // Check user's balance
      const tokenAccountInfo = await connection.getParsedAccountInfo(userTokenAccount);
      
      if (!tokenAccountInfo.value) {
        throw new Error('Token account not found');
      }

      const accountData = tokenAccountInfo.value.data as any;
      const currentBalance = accountData.parsed?.info?.tokenAmount?.uiAmount || 0;
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient balance. You have ${currentBalance} zkRUNE.`);
      }

      // Check if vault token account exists
      const vaultAccountInfo = await connection.getAccountInfo(vaultTokenAccount);
      
      const transaction = new Transaction();

      // Create vault token account if it doesn't exist
      if (!vaultAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,           // payer
            vaultTokenAccount,   // associated token account
            vaultAddress,        // owner
            mintAddress,         // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Create transfer instruction
      transaction.add(
        createTransferInstruction(
          userTokenAccount,    // source
          vaultTokenAccount,   // destination
          publicKey,           // owner
          rawAmount,           // amount
          [],                  // multi-signers
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Stake transaction sent:', signature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      const result: StakeResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
        amount,
      };

      setState({ isStaking: false, isUnstaking: false, result, error: null });
      return result;

    } catch (error: any) {
      console.error('Staking failed:', error);
      const errorMessage = error.message || 'Unknown error';
      
      const result: StakeResult = {
        success: false,
        error: errorMessage,
      };

      setState({ isStaking: false, isUnstaking: false, result, error: errorMessage });
      return result;
    }
  }, [publicKey, connection, sendTransaction, isVaultConfigured]);

  /**
   * Get staked balance (from vault perspective)
   * In production, this would query a staking program PDA
   */
  const getStakedBalance = useCallback(async (): Promise<number> => {
    // For now, return 0 as we track staking in Supabase/localStorage
    // Real implementation would query the staking program
    return 0;
  }, []);

  const reset = useCallback(() => {
    setState({ isStaking: false, isUnstaking: false, result: null, error: null });
  }, []);

  return {
    stakeTokens,
    getStakedBalance,
    isVaultConfigured,
    isStaking: state.isStaking,
    isUnstaking: state.isUnstaking,
    result: state.result,
    error: state.error,
    reset,
  };
}
