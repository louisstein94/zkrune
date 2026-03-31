// Solana Configuration
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '';

// Auto-detect network from RPC URL, fall back to NEXT_PUBLIC_SOLANA_NETWORK env
function detectNetwork(): WalletAdapterNetwork {
  const rpc = customRpc.toLowerCase();
  if (rpc.includes('mainnet')) return WalletAdapterNetwork.Mainnet;
  if (rpc.includes('devnet')) return WalletAdapterNetwork.Devnet;
  if (rpc.includes('testnet')) return WalletAdapterNetwork.Testnet;

  const explicit = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  if (explicit === 'mainnet-beta') return WalletAdapterNetwork.Mainnet;
  if (explicit === 'testnet') return WalletAdapterNetwork.Testnet;
  return WalletAdapterNetwork.Devnet;
}

export const SOLANA_NETWORK = detectNetwork();
export const SOLANA_RPC_ENDPOINT = customRpc || clusterApiUrl(SOLANA_NETWORK);

// zkRUNE Token Configuration
export const ZKRUNE_TOKEN_CONFIG = {
  // Mainnet token address (from pump.fun)
  MINT_ADDRESS: process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump',
  DECIMALS: 6,
  SYMBOL: 'zkRUNE',
  NAME: 'zkRune',
};

// Staking Token (Devnet test token - separate from mainnet)
export const STAKING_TOKEN_CONFIG = {
  MINT_ADDRESS: process.env.NEXT_PUBLIC_STAKING_TOKEN_MINT || 'BWoksbT58fuiyKsqbVihiWi8WejzhdN1fTNDk4roKJXf',
  DECIMALS: 6,
  SYMBOL: 'zkRUNE',
  NAME: 'zkRune (Devnet)',
};

// Program IDs
export const PROGRAM_IDS = {
  // Groth16 Verifier Program (Mainnet deployed)
  GROTH16_VERIFIER: process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad',
  // Governance Program (future)
  GOVERNANCE: process.env.NEXT_PUBLIC_GOVERNANCE_PROGRAM || '',
  // Staking Program (Devnet deployed)
  STAKING: process.env.NEXT_PUBLIC_STAKING_PROGRAM_ID || '44ToPJzWsnqJRhvFS5wXLsgWGWpbe3YwhU9t8LkQBRiX',
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
