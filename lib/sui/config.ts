// Sui Network Configuration

export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

function detectNetwork(): SuiNetwork {
  const explicit = process.env.NEXT_PUBLIC_SUI_NETWORK;
  if (explicit === 'mainnet') return 'mainnet';
  if (explicit === 'testnet') return 'testnet';
  if (explicit === 'localnet') return 'localnet';
  return 'devnet';
}

export const SUI_NETWORK = detectNetwork();

export const SUI_RPC_ENDPOINTS: Record<SuiNetwork, string> = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  testnet: 'https://fullnode.testnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
  localnet: 'http://127.0.0.1:9000',
};

export const SUI_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SUI_RPC_URL || SUI_RPC_ENDPOINTS[SUI_NETWORK];

export const SUI_PROGRAM_IDS = {
  GROTH16_VERIFIER_PACKAGE: process.env.NEXT_PUBLIC_SUI_GROTH16_PACKAGE || '',
  VERIFIER_REGISTRY: process.env.NEXT_PUBLIC_SUI_VERIFIER_REGISTRY || '',
};

export const TEMPLATE_NAMES: Record<number, string> = {
  0: 'age-verification',
  1: 'balance-proof',
  2: 'membership-proof',
  3: 'credential-proof',
  4: 'private-voting',
  5: 'nft-ownership',
  6: 'range-proof',
  7: 'hash-preimage',
  8: 'quadratic-voting',
  9: 'anonymous-reputation',
  10: 'token-swap',
  11: 'patience-proof',
  12: 'signature-verification',
};

export const getExplorerUrl = (
  digest: string,
  type: 'txblock' | 'object' = 'txblock',
): string => {
  const network = SUI_NETWORK === 'mainnet' ? '' : `?network=${SUI_NETWORK}`;
  return `https://suiscan.xyz/${SUI_NETWORK}/${type}/${digest}${network}`;
};
