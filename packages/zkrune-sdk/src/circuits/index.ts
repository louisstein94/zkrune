export { CircuitLoader, type CircuitFiles } from './loader';

export const templates = {
  AGE_VERIFICATION: 'age-verification',
  BALANCE_PROOF: 'balance-proof',
  MEMBERSHIP_PROOF: 'membership-proof',
  RANGE_PROOF: 'range-proof',
  PRIVATE_VOTING: 'private-voting',
  HASH_PREIMAGE: 'hash-preimage',
  CREDENTIAL_PROOF: 'credential-proof',
  TOKEN_SWAP: 'token-swap',
  SIGNATURE_VERIFICATION: 'signature-verification',
  PATIENCE_PROOF: 'patience-proof',
  QUADRATIC_VOTING: 'quadratic-voting',
  NFT_OWNERSHIP: 'nft-ownership',
  ANONYMOUS_REPUTATION: 'anonymous-reputation',
} as const;
