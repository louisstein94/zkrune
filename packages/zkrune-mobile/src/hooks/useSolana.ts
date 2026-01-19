/**
 * zkRune Mobile - useSolana Hook
 * React hook for Solana blockchain operations
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  solanaRpc, 
  Network, 
  TokenBalance, 
  TransactionInfo,
  RPC_ENDPOINTS,
} from '../services/solanaRpc';

export interface UseSolanaReturn {
  // State
  isInitialized: boolean;
  isHealthy: boolean;
  network: Network;
  endpoint: string;
  currentSlot: number;
  
  // Balance operations
  getBalance: (publicKey: string) => Promise<number>;
  getTokenBalances: (publicKey: string) => Promise<TokenBalance[]>;
  getZkRuneBalance: (publicKey: string) => Promise<number>;
  
  // Transaction operations
  getRecentTransactions: (publicKey: string, limit?: number) => Promise<TransactionInfo[]>;
  getTransaction: (signature: string) => Promise<any | null>;
  sendTransaction: (signedTx: string) => Promise<string | null>;
  
  // Network operations
  setNetwork: (network: Network) => Promise<void>;
  setCustomEndpoint: (endpoint: string) => Promise<void>;
  checkHealth: () => Promise<boolean>;
  refreshSlot: () => Promise<void>;
  
  // Helpers
  formatLamports: (lamports: number) => string;
  getNetworkName: (network: Network) => string;
}

export function useSolana(): UseSolanaReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [network, setNetworkState] = useState<Network>('mainnet-beta');
  const [endpoint, setEndpointState] = useState(RPC_ENDPOINTS.MAINNET);
  const [currentSlot, setCurrentSlot] = useState(0);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await solanaRpc.init();
      setNetworkState(solanaRpc.getNetwork());
      setEndpointState(solanaRpc.getEndpoint());
      
      const healthy = await solanaRpc.checkHealth();
      setIsHealthy(healthy);
      
      if (healthy) {
        const slot = await solanaRpc.getSlot();
        setCurrentSlot(slot);
      }
      
      setIsInitialized(true);
    };

    init();
  }, []);

  // Get SOL balance
  const getBalance = useCallback(async (publicKey: string): Promise<number> => {
    return solanaRpc.getBalance(publicKey);
  }, []);

  // Get all token balances
  const getTokenBalances = useCallback(async (publicKey: string): Promise<TokenBalance[]> => {
    return solanaRpc.getTokenAccounts(publicKey);
  }, []);

  // Get zkRUNE balance
  const getZkRuneBalance = useCallback(async (publicKey: string): Promise<number> => {
    return solanaRpc.getZkRuneBalance(publicKey);
  }, []);

  // Get recent transactions
  const getRecentTransactions = useCallback(async (
    publicKey: string, 
    limit = 10
  ): Promise<TransactionInfo[]> => {
    return solanaRpc.getRecentTransactions(publicKey, limit);
  }, []);

  // Get transaction details
  const getTransaction = useCallback(async (signature: string): Promise<any | null> => {
    return solanaRpc.getTransaction(signature);
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (signedTx: string): Promise<string | null> => {
    return solanaRpc.sendTransaction(signedTx);
  }, []);

  // Set network
  const setNetwork = useCallback(async (newNetwork: Network): Promise<void> => {
    await solanaRpc.setNetwork(newNetwork);
    setNetworkState(newNetwork);
    setEndpointState(solanaRpc.getEndpoint());
    
    const healthy = await solanaRpc.checkHealth();
    setIsHealthy(healthy);
  }, []);

  // Set custom endpoint
  const setCustomEndpoint = useCallback(async (newEndpoint: string): Promise<void> => {
    await solanaRpc.setEndpoint(newEndpoint);
    setEndpointState(newEndpoint);
    
    const healthy = await solanaRpc.checkHealth();
    setIsHealthy(healthy);
  }, []);

  // Check health
  const checkHealth = useCallback(async (): Promise<boolean> => {
    const healthy = await solanaRpc.checkHealth();
    setIsHealthy(healthy);
    return healthy;
  }, []);

  // Refresh current slot
  const refreshSlot = useCallback(async (): Promise<void> => {
    const slot = await solanaRpc.getSlot();
    setCurrentSlot(slot);
  }, []);

  // Format lamports to SOL
  const formatLamports = useCallback((lamports: number): string => {
    return (lamports / 1e9).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 9,
    });
  }, []);

  // Get network display name
  const getNetworkName = useCallback((net: Network): string => {
    switch (net) {
      case 'mainnet-beta':
        return 'Mainnet';
      case 'devnet':
        return 'Devnet';
      case 'testnet':
        return 'Testnet';
      default:
        return net;
    }
  }, []);

  return {
    isInitialized,
    isHealthy,
    network,
    endpoint,
    currentSlot,
    getBalance,
    getTokenBalances,
    getZkRuneBalance,
    getRecentTransactions,
    getTransaction,
    sendTransaction,
    setNetwork,
    setCustomEndpoint,
    checkHealth,
    refreshSlot,
    formatLamports,
    getNetworkName,
  };
}

export default useSolana;
