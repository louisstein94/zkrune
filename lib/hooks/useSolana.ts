"use client";

import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createBurnInstruction,
  getAccount,
} from '@solana/spl-token';
import { ZKRUNE_TOKEN_CONFIG, TX_SETTINGS, getExplorerUrl } from '@/lib/solana/config';

interface TokenBalance {
  amount: number;
  decimals: number;
  uiAmount: number;
}

interface UseSolanaReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  walletAddress: string | null;
  
  // Balances
  solBalance: number;
  zkruneBalance: TokenBalance | null;
  isLoadingBalances: boolean;
  
  // Actions
  refreshBalances: () => Promise<void>;
  sendTransaction: (instructions: TransactionInstruction[]) => Promise<string>;
  burnTokens: (amount: number) => Promise<string>;
  
  // Utils
  getExplorerUrl: (signature: string) => string;
  error: string | null;
}

export function useSolana(): UseSolanaReturn {
  const { connection } = useConnection();
  const { publicKey, connected, connecting, signTransaction, sendTransaction: walletSendTx } = useWallet();
  
  const [solBalance, setSolBalance] = useState<number>(0);
  const [zkruneBalance, setZkruneBalance] = useState<TokenBalance | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch SOL balance
  const fetchSolBalance = useCallback(async () => {
    if (!publicKey || !connection) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (err) {
      console.error('Error fetching SOL balance:', err);
      return 0;
    }
  }, [publicKey, connection]);

  // Fetch zkRUNE token balance
  const fetchTokenBalance = useCallback(async (): Promise<TokenBalance | null> => {
    if (!publicKey || !connection) return null;
    
    try {
      const mintPubkey = new PublicKey(ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS);
      const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
      
      try {
        const account = await getAccount(connection, ata);
        const amount = Number(account.amount);
        const decimals = ZKRUNE_TOKEN_CONFIG.DECIMALS;
        const uiAmount = amount / Math.pow(10, decimals);
        
        return { amount, decimals, uiAmount };
      } catch {
        // Token account doesn't exist = 0 balance
        return { amount: 0, decimals: ZKRUNE_TOKEN_CONFIG.DECIMALS, uiAmount: 0 };
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      return null;
    }
  }, [publicKey, connection]);

  // Refresh all balances
  const refreshBalances = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    setIsLoadingBalances(true);
    setError(null);
    
    try {
      const [sol, token] = await Promise.all([
        fetchSolBalance(),
        fetchTokenBalance(),
      ]);
      
      setSolBalance(sol);
      setZkruneBalance(token);
    } catch (err) {
      console.error('Error refreshing balances:', err);
      setError('Failed to fetch balances');
    } finally {
      setIsLoadingBalances(false);
    }
  }, [connected, publicKey, fetchSolBalance, fetchTokenBalance]);

  // Auto-refresh balances on connection
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalances();
      
      // Set up polling for balance updates
      const interval = setInterval(refreshBalances, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKey, refreshBalances]);

  // Send transaction with instructions
  const sendTransaction = useCallback(async (instructions: TransactionInstruction[]): Promise<string> => {
    if (!publicKey || !signTransaction || !connection) {
      throw new Error('Wallet not connected');
    }
    
    setError(null);
    
    try {
      const transaction = new Transaction();
      instructions.forEach(ix => transaction.add(ix));
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(TX_SETTINGS.COMMITMENT);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign and send
      const signature = await walletSendTx(transaction, connection, {
        preflightCommitment: TX_SETTINGS.PREFLIGHT_COMMITMENT,
        maxRetries: TX_SETTINGS.MAX_RETRIES,
      });
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, TX_SETTINGS.COMMITMENT);
      
      // Refresh balances after transaction
      await refreshBalances();
      
      return signature;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      throw err;
    }
  }, [publicKey, signTransaction, connection, walletSendTx, refreshBalances]);

  // Burn zkRUNE tokens
  const burnTokens = useCallback(async (amount: number): Promise<string> => {
    if (!publicKey || !connection) {
      throw new Error('Wallet not connected');
    }
    
    if (!zkruneBalance || zkruneBalance.uiAmount < amount) {
      throw new Error('Insufficient token balance');
    }
    
    try {
      const mintPubkey = new PublicKey(ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS);
      const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
      
      // Convert UI amount to raw amount
      const rawAmount = BigInt(Math.floor(amount * Math.pow(10, ZKRUNE_TOKEN_CONFIG.DECIMALS)));
      
      const burnIx = createBurnInstruction(
        ata,           // Token account to burn from
        mintPubkey,    // Mint
        publicKey,     // Owner
        rawAmount,     // Amount to burn
      );
      
      const signature = await sendTransaction([burnIx]);
      
      console.log(`Burned ${amount} zkRUNE. Signature: ${signature}`);
      
      return signature;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Burn failed';
      setError(message);
      throw err;
    }
  }, [publicKey, connection, zkruneBalance, sendTransaction]);

  return {
    // Connection state
    connected,
    connecting,
    publicKey,
    walletAddress: publicKey?.toBase58() || null,
    
    // Balances
    solBalance,
    zkruneBalance,
    isLoadingBalances,
    
    // Actions
    refreshBalances,
    sendTransaction,
    burnTokens,
    
    // Utils
    getExplorerUrl: (sig: string) => getExplorerUrl(sig, 'tx'),
    error,
  };
}
