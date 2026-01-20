/**
 * zkRune Mobile - Solana RPC Service
 * Blockchain interaction and data fetching
 */

import Constants from 'expo-constants';
import { secureStorage, STORAGE_KEYS } from './secureStorage';

// Get API key from environment (with fallback for development)
const HELIUS_API_KEY = Constants.expoConfig?.extra?.heliusApiKey || 'bd23840a-c606-4c7d-a300-805af20fbb84';

// Build RPC endpoints dynamically
const buildHeliusUrl = (network: 'mainnet' | 'devnet') => {
  if (!HELIUS_API_KEY) return null;
  return `https://${network}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
};

// Default RPC endpoints
export const RPC_ENDPOINTS = {
  // Helius (Primary - faster & more reliable) - requires API key
  HELIUS_MAINNET: buildHeliusUrl('mainnet') || 'https://api.mainnet-beta.solana.com',
  HELIUS_DEVNET: buildHeliusUrl('devnet') || 'https://api.devnet.solana.com',
  // Public fallbacks (always available)
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
} as const;

// Default to Helius if key available, otherwise public RPC
export const DEFAULT_MAINNET_RPC = RPC_ENDPOINTS.HELIUS_MAINNET;
export const DEFAULT_DEVNET_RPC = RPC_ENDPOINTS.HELIUS_DEVNET;

export type Network = 'mainnet-beta' | 'devnet' | 'testnet';

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export interface AccountInfo {
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

export interface TransactionInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: object | null;
  memo: string | null;
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// zkRUNE token info (Solana mainnet - Pump.fun)
export const ZKRUNE_TOKEN: TokenInfo = {
  mint: '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump',
  symbol: 'zkRUNE',
  name: 'zkRune Token',
  decimals: 6,
  logoURI: 'https://zkrune.com/token-logo.png',
};

// Premium tiers (burn to unlock)
export const PREMIUM_TIERS = {
  FREE: { burnRequired: 0, proofLimit: 5 },
  BUILDER: { burnRequired: 100, proofLimit: -1 },
  PRO: { burnRequired: 500, proofLimit: -1, gasless: true },
  ENTERPRISE: { burnRequired: 2000, proofLimit: -1, gasless: true, whiteLabel: true },
} as const;

// Staking config
export const STAKING_CONFIG = {
  BASE_APY: 12,
  MAX_APY: 36,
  MIN_STAKE: 100,
  LOCK_PERIODS: [
    { days: 30, multiplier: 1.0, name: 'Flexible' },
    { days: 90, multiplier: 1.5, name: '3 Months' },
    { days: 180, multiplier: 2.0, name: '6 Months' },
    { days: 365, multiplier: 3.0, name: '1 Year' },
  ],
} as const;

/**
 * Solana RPC service
 */
class SolanaRpcService {
  private _endpoint: string = DEFAULT_MAINNET_RPC;
  private _network: Network = 'mainnet-beta';

  /**
   * Initialize the RPC service
   */
  async init(): Promise<void> {
    const savedEndpoint = await secureStorage.get(STORAGE_KEYS.RPC_ENDPOINT);
    const savedNetwork = await secureStorage.get(STORAGE_KEYS.NETWORK);

    if (savedNetwork) {
      this._network = savedNetwork as Network;
    }

    if (savedEndpoint) {
      this._endpoint = savedEndpoint;
    } else {
      // Default to Helius based on network
      this._endpoint = this._network === 'devnet' 
        ? DEFAULT_DEVNET_RPC 
        : DEFAULT_MAINNET_RPC;
    }
    
    console.log(`[SolanaRPC] Initialized with ${this._network} @ ${this._endpoint.split('?')[0]}...`);
  }

  /**
   * Set RPC endpoint
   */
  async setEndpoint(endpoint: string): Promise<void> {
    this._endpoint = endpoint;
    await secureStorage.set(STORAGE_KEYS.RPC_ENDPOINT, endpoint);
  }

  /**
   * Set network
   */
  async setNetwork(network: Network): Promise<void> {
    this._network = network;
    await secureStorage.set(STORAGE_KEYS.NETWORK, network);

    // Update endpoint based on network (prefer Helius)
    switch (network) {
      case 'mainnet-beta':
        this._endpoint = DEFAULT_MAINNET_RPC;
        break;
      case 'devnet':
        this._endpoint = DEFAULT_DEVNET_RPC;
        break;
      case 'testnet':
        this._endpoint = RPC_ENDPOINTS.TESTNET;
        break;
    }
    
    await secureStorage.set(STORAGE_KEYS.RPC_ENDPOINT, this._endpoint);
  }

  /**
   * Get current network
   */
  getNetwork(): Network {
    return this._network;
  }

  /**
   * Get current endpoint
   */
  getEndpoint(): string {
    return this._endpoint;
  }

  /**
   * Make an RPC request
   */
  private async _request<T>(method: string, params: any[] = []): Promise<T> {
    try {
      const response = await fetch(this._endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'RPC Error');
      }

      return data.result as T;
    } catch (error) {
      console.error(`[SolanaRPC] ${method} failed:`, error);
      throw error;
    }
  }

  /**
   * Get SOL balance for an address
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const result = await this._request<{ value: number }>('getBalance', [publicKey]);
      return result.value / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('[SolanaRPC] Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(publicKey: string): Promise<AccountInfo | null> {
    try {
      const result = await this._request<{ value: AccountInfo | null }>('getAccountInfo', [
        publicKey,
        { encoding: 'base64' },
      ]);
      return result.value;
    } catch (error) {
      console.error('[SolanaRPC] Failed to get account info:', error);
      return null;
    }
  }

  /**
   * Get token accounts by owner
   */
  async getTokenAccounts(ownerPublicKey: string): Promise<TokenBalance[]> {
    try {
      const result = await this._request<{
        value: Array<{
          account: {
            data: {
              parsed: {
                info: {
                  mint: string;
                  tokenAmount: {
                    amount: string;
                    decimals: number;
                    uiAmount: number;
                  };
                };
              };
            };
          };
        }>;
      }>('getTokenAccountsByOwner', [
        ownerPublicKey,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' },
      ]);

      return result.value.map((item) => {
        const info = item.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: info.tokenAmount.amount,
          decimals: info.tokenAmount.decimals,
          uiAmount: info.tokenAmount.uiAmount,
        };
      });
    } catch (error) {
      console.error('[SolanaRPC] Failed to get token accounts:', error);
      return [];
    }
  }

  /**
   * Get zkRUNE token balance
   */
  async getZkRuneBalance(ownerPublicKey: string): Promise<number> {
    try {
      const tokens = await this.getTokenAccounts(ownerPublicKey);
      const zkRuneToken = tokens.find((t) => t.mint === ZKRUNE_TOKEN.mint);
      return zkRuneToken?.uiAmount || 0;
    } catch (error) {
      console.error('[SolanaRPC] Failed to get zkRUNE balance:', error);
      return 0;
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(publicKey: string, limit = 10): Promise<TransactionInfo[]> {
    try {
      const signatures = await this._request<Array<{
        signature: string;
        slot: number;
        blockTime: number | null;
        err: object | null;
        memo: string | null;
      }>>('getSignaturesForAddress', [publicKey, { limit }]);

      return signatures;
    } catch (error) {
      console.error('[SolanaRPC] Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<any | null> {
    try {
      const result = await this._request<any>('getTransaction', [
        signature,
        { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
      ]);
      return result;
    } catch (error) {
      console.error('[SolanaRPC] Failed to get transaction:', error);
      return null;
    }
  }

  /**
   * Get current slot
   */
  async getSlot(): Promise<number> {
    try {
      return await this._request<number>('getSlot');
    } catch (error) {
      console.error('[SolanaRPC] Failed to get slot:', error);
      return 0;
    }
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash(): Promise<string | null> {
    try {
      const result = await this._request<{
        value: { blockhash: string };
      }>('getLatestBlockhash');
      return result.value.blockhash;
    } catch (error) {
      console.error('[SolanaRPC] Failed to get blockhash:', error);
      return null;
    }
  }

  /**
   * Send raw transaction
   */
  async sendTransaction(signedTransaction: string): Promise<string | null> {
    try {
      const signature = await this._request<string>('sendTransaction', [
        signedTransaction,
        { encoding: 'base64', skipPreflight: false },
      ]);
      return signature;
    } catch (error) {
      console.error('[SolanaRPC] Failed to send transaction:', error);
      return null;
    }
  }

  /**
   * Check if RPC endpoint is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const slot = await this.getSlot();
      return slot > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get cluster nodes (for network info)
   */
  async getClusterNodes(): Promise<number> {
    try {
      const nodes = await this._request<any[]>('getClusterNodes');
      return nodes.length;
    } catch {
      return 0;
    }
  }
}

export const solanaRpc = new SolanaRpcService();
export default solanaRpc;
