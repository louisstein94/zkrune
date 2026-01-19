/**
 * zkRune Mobile - useWallet Hook
 * React hook for wallet connection and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { 
  walletService, 
  WalletProvider, 
  WalletConnection,
  NativeWallet,
} from '../services/walletService';
import { solanaRpc } from '../services/solanaRpc';

export interface UseWalletReturn {
  // State
  connection: WalletConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: number;
  zkRuneBalance: number;
  availableWallets: WalletProvider[];
  hasNativeWallet: boolean;
  
  // External wallet actions
  connect: (provider: WalletProvider) => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<void>;
  
  // Native wallet actions
  createNativeWallet: (name?: string) => Promise<{ wallet: NativeWallet; mnemonic: string } | null>;
  importFromSeedPhrase: (mnemonic: string, name?: string) => Promise<NativeWallet | null>;
  importFromPrivateKey: (privateKey: string | number[], name?: string) => Promise<NativeWallet | null>;
  exportSeedPhrase: () => Promise<string | null>;
  exportPrivateKey: () => Promise<string | null>;
  
  // Helpers
  shortenAddress: (address: string) => string;
  getProviderName: (provider: WalletProvider) => string;
}

export function useWallet(): UseWalletReturn {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [zkRuneBalance, setZkRuneBalance] = useState(0);
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([]);
  const [hasNativeWallet, setHasNativeWallet] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const existingConnection = await walletService.getConnection();
      if (existingConnection) {
        setConnection(existingConnection);
        await refreshBalances(existingConnection.publicKey);
      }
    };

    const checkAvailableWallets = async () => {
      const wallets = await walletService.getAvailableWallets();
      setAvailableWallets(wallets);
    };

    const checkNativeWallet = async () => {
      const hasNative = await walletService.hasNativeWallet();
      setHasNativeWallet(hasNative);
    };

    checkConnection();
    checkAvailableWallets();
    checkNativeWallet();
  }, []);

  // Handle deep link callbacks
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url.includes('wallet/callback')) {
        const newConnection = await walletService.handleCallback(event.url);
        if (newConnection) {
          setConnection(newConnection);
          await refreshBalances(newConnection.publicKey);
        }
        setIsConnecting(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async (publicKey: string) => {
    try {
      const [solBalance, zkBalance] = await Promise.all([
        solanaRpc.getBalance(publicKey),
        solanaRpc.getZkRuneBalance(publicKey),
      ]);
      setBalance(solBalance);
      setZkRuneBalance(zkBalance);
    } catch (error) {
      console.error('[useWallet] Failed to refresh balances:', error);
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async (provider: WalletProvider): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      let success: boolean;
      
      if (provider === WalletProvider.PHANTOM) {
        success = await walletService.connectPhantom();
      } else {
        success = await walletService.connectSolflare();
      }

      if (!success) {
        setIsConnecting(false);
      }

      return success;
    } catch (error) {
      console.error('[useWallet] Connect failed:', error);
      setIsConnecting(false);
      return false;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async (): Promise<void> => {
    await walletService.disconnect();
    setConnection(null);
    setBalance(0);
    setZkRuneBalance(0);
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (connection) {
      await refreshBalances(connection.publicKey);
    }
  }, [connection, refreshBalances]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<void> => {
    if (!connection) {
      throw new Error('No wallet connected');
    }
    await walletService.signMessage(message);
  }, [connection]);

  // Create native wallet
  const createNativeWallet = useCallback(async (name?: string) => {
    const result = await walletService.createWallet(name);
    if (result) {
      setConnection({
        publicKey: result.wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: result.wallet.walletType,
        name: result.wallet.name,
      });
      setHasNativeWallet(true);
      await refreshBalances(result.wallet.publicKey);
    }
    return result;
  }, [refreshBalances]);

  // Import from seed phrase
  const importFromSeedPhrase = useCallback(async (mnemonic: string, name?: string) => {
    const wallet = await walletService.importFromSeedPhrase(mnemonic, name);
    if (wallet) {
      setConnection({
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: wallet.walletType,
        name: wallet.name,
      });
      setHasNativeWallet(true);
      await refreshBalances(wallet.publicKey);
    }
    return wallet;
  }, [refreshBalances]);

  // Import from private key
  const importFromPrivateKey = useCallback(async (privateKey: string | number[], name?: string) => {
    const wallet = await walletService.importFromPrivateKey(privateKey, name);
    if (wallet) {
      setConnection({
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: wallet.walletType,
        name: wallet.name,
      });
      setHasNativeWallet(true);
      await refreshBalances(wallet.publicKey);
    }
    return wallet;
  }, [refreshBalances]);

  // Export seed phrase
  const exportSeedPhrase = useCallback(async () => {
    return walletService.exportSeedPhrase();
  }, []);

  // Export private key
  const exportPrivateKey = useCallback(async () => {
    return walletService.exportPrivateKey();
  }, []);

  // Helpers
  const shortenAddress = useCallback((address: string): string => {
    return walletService.shortenAddress(address);
  }, []);

  const getProviderName = useCallback((provider: WalletProvider): string => {
    return walletService.getProviderName(provider);
  }, []);

  return {
    connection,
    isConnected: connection !== null,
    isConnecting,
    balance,
    zkRuneBalance,
    availableWallets,
    hasNativeWallet,
    connect,
    disconnect,
    refreshBalance,
    signMessage,
    createNativeWallet,
    importFromSeedPhrase,
    importFromPrivateKey,
    exportSeedPhrase,
    exportPrivateKey,
    shortenAddress,
    getProviderName,
  };
}

export default useWallet;
