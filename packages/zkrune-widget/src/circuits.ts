import type { CircuitMeta, CircuitId, FieldSchema } from './types';

export const CIRCUITS: Record<CircuitId, CircuitMeta> = {
  'age-verification': {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Prove you meet a minimum age requirement without revealing your birth year',
    category: 'identity',
    fields: [
      { name: 'birthYear', label: 'Birth Year', description: 'Year of birth (4-digit)', required: true, type: 'integer' },
      { name: 'currentYear', label: 'Current Year', description: 'Current calendar year', required: true, type: 'integer' },
      { name: 'minimumAge', label: 'Minimum Age', description: 'Required minimum age', required: true, type: 'integer' },
    ],
  },
  'balance-proof': {
    id: 'balance-proof',
    name: 'Balance Proof',
    description: 'Prove your balance exceeds a threshold without revealing the amount',
    category: 'financial',
    fields: [
      { name: 'balance', label: 'Balance', description: 'Actual token balance', required: true, type: 'integer' },
      { name: 'minimumBalance', label: 'Minimum Balance', description: 'Required minimum', required: true, type: 'integer' },
    ],
  },
  'membership-proof': {
    id: 'membership-proof',
    name: 'Membership Proof',
    description: 'Prove membership in a group without revealing your identity',
    category: 'identity',
    fields: [
      { name: 'memberId', label: 'Member ID', description: 'Private member identifier', required: true, type: 'hash' },
      { name: 'groupHash', label: 'Group Hash', description: 'Hash of the group set', required: true, type: 'hash' },
    ],
  },
  'range-proof': {
    id: 'range-proof',
    name: 'Range Proof',
    description: 'Prove a value falls within a range without revealing it',
    category: 'financial',
    fields: [
      { name: 'value', label: 'Value', description: 'Private value', required: true, type: 'integer' },
      { name: 'minRange', label: 'Minimum', description: 'Lower bound (inclusive)', required: true, type: 'integer' },
      { name: 'maxRange', label: 'Maximum', description: 'Upper bound (inclusive)', required: true, type: 'integer' },
    ],
  },
  'private-voting': {
    id: 'private-voting',
    name: 'Private Voting',
    description: 'Cast a verifiable vote without revealing your identity',
    category: 'governance',
    fields: [
      { name: 'voterId', label: 'Voter ID', description: 'Private voter identifier', required: true, type: 'hash' },
      { name: 'voteChoice', label: 'Vote Choice', description: 'Numeric vote option', required: true, type: 'integer' },
      { name: 'pollId', label: 'Poll ID', description: 'Poll identifier', required: true, type: 'hash' },
    ],
  },
  'hash-preimage': {
    id: 'hash-preimage',
    name: 'Hash Preimage',
    description: 'Prove knowledge of a hash preimage without revealing it',
    category: 'cryptographic',
    fields: [
      { name: 'preimage', label: 'Preimage', description: 'Secret preimage value', required: true, type: 'hash' },
      { name: 'salt', label: 'Salt', description: 'Random salt', required: true, type: 'hash' },
      { name: 'expectedHash', label: 'Expected Hash', description: 'Public hash to verify against', required: true, type: 'hash' },
    ],
  },
  'credential-proof': {
    id: 'credential-proof',
    name: 'Credential Proof',
    description: 'Prove possession of a valid credential without exposing it',
    category: 'identity',
    fields: [
      { name: 'credentialHash', label: 'Credential Hash', description: 'Hash of credential data', required: true, type: 'hash' },
      { name: 'credentialSecret', label: 'Credential Secret', description: 'Private key bound to credential', required: true, type: 'hash' },
      { name: 'validUntil', label: 'Valid Until', description: 'Expiry timestamp', required: true, type: 'timestamp' },
      { name: 'currentTime', label: 'Current Time', description: 'Current timestamp', required: true, type: 'timestamp' },
      { name: 'expectedHash', label: 'Expected Hash', description: 'Public commitment hash', required: true, type: 'hash' },
    ],
  },
  'token-swap': {
    id: 'token-swap',
    name: 'Token Swap',
    description: 'Prove eligibility for a token swap without revealing your full balance',
    category: 'financial',
    fields: [
      { name: 'tokenABalance', label: 'Token A Balance', description: 'Source token balance', required: true, type: 'integer' },
      { name: 'swapSecret', label: 'Swap Secret', description: 'Private swap secret', required: true, type: 'hash' },
      { name: 'requiredTokenA', label: 'Required Token A', description: 'Minimum source amount', required: true, type: 'integer' },
      { name: 'swapRate', label: 'Swap Rate', description: 'Exchange rate multiplier', required: true, type: 'integer' },
      { name: 'minReceive', label: 'Min Receive', description: 'Minimum tokens to receive', required: true, type: 'integer' },
    ],
  },
  'signature-verification': {
    id: 'signature-verification',
    name: 'Signature Verification',
    description: 'Verify an EdDSA signature inside a zero-knowledge circuit',
    category: 'cryptographic',
    fields: [
      { name: 'R8x', label: 'R8 X', description: 'X coordinate of R8', required: true, type: 'hash' },
      { name: 'R8y', label: 'R8 Y', description: 'Y coordinate of R8', required: true, type: 'hash' },
      { name: 'S', label: 'S', description: 'Scalar component', required: true, type: 'hash' },
      { name: 'Ax', label: 'Public Key X', description: 'Signer pub key X', required: true, type: 'hash' },
      { name: 'Ay', label: 'Public Key Y', description: 'Signer pub key Y', required: true, type: 'hash' },
      { name: 'M', label: 'Message', description: 'Signed message', required: true, type: 'hash' },
    ],
  },
  'patience-proof': {
    id: 'patience-proof',
    name: 'Patience Proof',
    description: 'Prove a minimum waiting period has elapsed',
    category: 'cryptographic',
    fields: [
      { name: 'startTime', label: 'Start Time', description: 'Wait start timestamp', required: true, type: 'timestamp' },
      { name: 'endTime', label: 'End Time', description: 'Wait end timestamp', required: true, type: 'timestamp' },
      { name: 'secret', label: 'Secret', description: 'Time-lock secret', required: true, type: 'hash' },
      { name: 'minimumWaitTime', label: 'Min Wait', description: 'Required wait (seconds)', required: true, type: 'integer' },
      { name: 'commitmentHash', label: 'Commitment Hash', description: 'Public commitment', required: true, type: 'hash' },
    ],
  },
  'quadratic-voting': {
    id: 'quadratic-voting',
    name: 'Quadratic Voting',
    description: 'Cast a quadratic vote weighted by token balance',
    category: 'governance',
    fields: [
      { name: 'voterId', label: 'Voter ID', description: 'Private voter identifier', required: true, type: 'hash' },
      { name: 'tokenBalance', label: 'Token Balance', description: 'Governance tokens held', required: true, type: 'integer' },
      { name: 'voteChoice', label: 'Vote Choice', description: 'Vote option', required: true, type: 'integer' },
      { name: 'pollId', label: 'Poll ID', description: 'Poll identifier', required: true, type: 'hash' },
      { name: 'minTokens', label: 'Min Tokens', description: 'Minimum to participate', required: true, type: 'integer' },
    ],
  },
  'nft-ownership': {
    id: 'nft-ownership',
    name: 'NFT Ownership',
    description: 'Prove you own an NFT without revealing which one',
    category: 'financial',
    fields: [
      { name: 'nftTokenId', label: 'NFT Token ID', description: 'Private token ID', required: true, type: 'integer' },
      { name: 'ownerSecret', label: 'Owner Secret', description: 'Ownership proof key', required: true, type: 'hash' },
      { name: 'collectionRoot', label: 'Collection Root', description: 'Merkle root of collection', required: true, type: 'hash' },
      { name: 'minTokenId', label: 'Min Token ID', description: 'Valid range lower bound', required: true, type: 'integer' },
      { name: 'maxTokenId', label: 'Max Token ID', description: 'Valid range upper bound', required: true, type: 'integer' },
    ],
  },
  'anonymous-reputation': {
    id: 'anonymous-reputation',
    name: 'Anonymous Reputation',
    description: 'Prove reputation score exceeds a threshold anonymously',
    category: 'identity',
    fields: [
      { name: 'userId', label: 'User ID', description: 'Private user identifier', required: true, type: 'hash' },
      { name: 'reputationScore', label: 'Reputation Score', description: 'Actual score', required: true, type: 'integer' },
      { name: 'userNonce', label: 'User Nonce', description: 'Random nonce for unlinkability', required: true, type: 'hash' },
      { name: 'thresholdScore', label: 'Threshold', description: 'Minimum score required', required: true, type: 'integer' },
      { name: 'platformId', label: 'Platform ID', description: 'Score issuer ID', required: true, type: 'hash' },
    ],
  },
  'whale-holder': {
    id: 'whale-holder',
    name: 'Whale Holder',
    description: 'Prove whale-level token holdings without revealing exact amount',
    category: 'financial',
    fields: [
      { name: 'balance', label: 'Balance', description: 'Actual token balance', required: true, type: 'integer' },
      { name: 'minimumBalance', label: 'Whale Threshold', description: 'Minimum whale balance', required: true, type: 'integer' },
    ],
  },
};

export const CIRCUIT_CATEGORIES = {
  identity: { label: 'Identity', icon: '🛡' },
  financial: { label: 'Financial', icon: '💰' },
  governance: { label: 'Governance', icon: '🗳' },
  cryptographic: { label: 'Cryptographic', icon: '🔐' },
} as const;

export function getCircuitsByCategory(): Record<string, CircuitMeta[]> {
  const grouped: Record<string, CircuitMeta[]> = {};
  for (const circuit of Object.values(CIRCUITS)) {
    if (!grouped[circuit.category]) grouped[circuit.category] = [];
    grouped[circuit.category].push(circuit);
  }
  return grouped;
}

export function validateInputs(
  circuitId: CircuitId,
  inputs: Record<string, string>,
): { valid: boolean; errors: string[] } {
  const schema = CIRCUITS[circuitId];
  if (!schema) return { valid: false, errors: [`Unknown circuit: ${circuitId}`] };

  const errors: string[] = [];

  for (const field of schema.fields) {
    const value = inputs[field.name];
    if (field.required && (value === undefined || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }
    if (value === undefined || value === '') continue;

    if (field.type === 'integer' || field.type === 'timestamp') {
      if (!/^\d+$/.test(value)) {
        errors.push(`${field.label} must be a non-negative integer`);
      }
    }
    if (field.type === 'hash') {
      if (!/^\d+$/.test(value) && !/^0x[0-9a-fA-F]+$/.test(value)) {
        errors.push(`${field.label} must be a numeric or hex value`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
