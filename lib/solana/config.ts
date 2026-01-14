// Solana Configuration
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Environment-based network selection
export const SOLANA_NETWORK: WalletAdapterNetwork = 
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' 
    ? WalletAdapterNetwork.Mainnet 
    : process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'testnet'
    ? WalletAdapterNetwork.Testnet
    : WalletAdapterNetwork.Devnet;

// RPC Endpoints - Use custom RPC for production
export const SOLANA_RPC_ENDPOINT = 
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// zkRUNE Token Configuration
export const ZKRUNE_TOKEN_CONFIG = {
  // Mainnet token address (from pump.fun)
  MINT_ADDRESS: process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump',
  DECIMALS: 6,
  SYMBOL: 'zkRUNE',
  NAME: 'zkRune',
};

// Program IDs
export const PROGRAM_IDS = {
  // Groth16 Verifier Program (deploy to devnet first, then mainnet)
  GROTH16_VERIFIER: process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '',
  // Governance Program (future)
  GOVERNANCE: process.env.NEXT_PUBLIC_GOVERNANCE_PROGRAM || '',
  // Staking Program (future)
  STAKING: process.env.NEXT_PUBLIC_STAKING_PROGRAM || '',
};

// Transaction Confirmation Settings
export const TX_SETTINGS = {
  COMMITMENT: 'confirmed' as const,
  PREFLIGHT_COMMITMENT: 'confirmed' as const,
  MAX_RETRIES: 3,
};

// Explorer URLs
export const getExplorerUrl = (signature: string, type: 'tx' | 'address' = 'tx'): string => {
  const cluster = SOLANA_NETWORK === WalletAdapterNetwork.Mainnet ? '' : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/${type}/${signature}${cluster}`;
};

export const getSolscanUrl = (signature: string, type: 'tx' | 'account' = 'tx'): string => {
  const cluster = SOLANA_NETWORK === WalletAdapterNetwork.Mainnet ? '' : `?cluster=${SOLANA_NETWORK}`;
  return `https://solscan.io/${type}/${signature}${cluster}`;
};
