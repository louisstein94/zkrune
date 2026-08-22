export interface AgeVerificationInputs {
  birthYear: string;
  currentYear: string;
  minimumAge: string;
}

export interface BalanceProofInputs {
  balance: string;
  minimumBalance: string;
}

export interface MembershipProofInputs {
  memberId: string;
  groupHash: string;
}

export interface RangeProofInputs {
  value: string;
  minRange: string;
  maxRange: string;
}

export interface PrivateVotingInputs {
  voterId: string;
  voteChoice: string;
  pollId: string;
}

export interface HashPreimageInputs {
  preimage: string;
  salt: string;
  expectedHash: string;
}

export interface CredentialProofInputs {
  /** Secret handed to the holder at issuance. Private. */
  credentialSecret: string;
  /** Expiry stamped into the issuer's commitment. Private. */
  validUntil: string;
  /** Verification timestamp. Public. */
  currentTime: string;
  /** Poseidon(credentialSecret, validUntil), published by the issuer. Public. */
  expectedHash: string;
}

export interface TokenSwapInputs {
  tokenABalance: string;
  swapSecret: string;
  requiredTokenA: string;
  swapRate: string;
  minReceive: string;
}

export interface SignatureVerificationInputs {
  R8x: string;
  R8y: string;
  S: string;
  Ax: string;
  Ay: string;
  M: string;
}

export interface PatienceProofInputs {
  startTime: string;
  endTime: string;
  secret: string;
  minimumWaitTime: string;
  commitmentHash: string;
}

export interface QuadraticVotingInputs {
  voterId: string;
  tokenBalance: string;
  voteChoice: string;
  pollId: string;
  minTokens: string;
}

export interface NFTOwnershipInputs {
  nftTokenId: string;
  ownerSecret: string;
  collectionRoot: string;
  minTokenId: string;
  maxTokenId: string;
}

export interface AnonymousReputationInputs {
  userId: string;
  reputationScore: string;
  userNonce: string;
  thresholdScore: string;
  platformId: string;
}

export interface CircuitInputMap {
  'age-verification': AgeVerificationInputs;
  'balance-proof': BalanceProofInputs;
  'membership-proof': MembershipProofInputs;
  'range-proof': RangeProofInputs;
  'private-voting': PrivateVotingInputs;
  'hash-preimage': HashPreimageInputs;
  'credential-proof': CredentialProofInputs;
  'rwa-eligibility': RwaEligibilityInputs;
  'lockup-proof': LockupProofInputs;
  'token-swap': TokenSwapInputs;
  'signature-verification': SignatureVerificationInputs;
  'patience-proof': PatienceProofInputs;
  'quadratic-voting': QuadraticVotingInputs;
  'nft-ownership': NFTOwnershipInputs;
  'anonymous-reputation': AnonymousReputationInputs;
}

export type TemplateId = keyof CircuitInputMap;

export interface RwaEligibilityInputs {
  /** Holder-generated. The issuer never sees it, so a leaked credential is unusable. Private. */
  subjectSecret: string;
  /** See ACCREDITATION_TIERS. Private — a higher tier is never disclosed to a lower gate. */
  accreditationTier: string;
  /** ISO 3166-1 numeric. Private — only allowlist membership is revealed. */
  jurisdictionCode: string;
  issuedAt: string;
  expiresAt: string;
  /** EdDSA-Poseidon signature from the issuer over the credential hash. Private. */
  issuerR8x: string;
  issuerR8y: string;
  issuerS: string;
  jurisdictionPathElements: string[];
  jurisdictionPathIndices: string[];
  /** Issuer public key. The verifier's trust anchor. Public. */
  issuerAx: string;
  issuerAy: string;
  currentTime: string;
  requiredTier: string;
  jurisdictionRoot: string;
  /** Identifies the offering. Scopes the nullifier. Public. */
  policyId: string;
  /** Verifier-chosen and single-use. Binds the proof to one session. Public. */
  sessionNonce: string;
}

export interface LockupProofInputs {
  credentialSecret: string;
  lockedAmount: string;
  unlockTime: string;
  pathElements: string[];
  pathIndices: string[];
  issuerRoot: string;
  minimumAmount: string;
  currentTime: string;
  contextId: string;
}
