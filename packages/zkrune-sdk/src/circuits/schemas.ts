import type { TemplateId } from '../types';

export interface CircuitSchema {
  id: TemplateId;
  name: string;
  description: string;
  category: 'identity' | 'financial' | 'governance' | 'cryptographic';
  fields: FieldSchema[];
}

export interface FieldSchema {
  name: string;
  label: string;
  description: string;
  required: boolean;
  type: 'integer' | 'hash' | 'timestamp';
}

export const CIRCUIT_SCHEMAS: Record<TemplateId, CircuitSchema> = {
  'age-verification': {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Prove you meet a minimum age requirement without revealing your exact birth year',
    category: 'identity',
    fields: [
      { name: 'birthYear', label: 'Birth Year', description: 'Year of birth as a 4-digit number', required: true, type: 'integer' },
      { name: 'currentYear', label: 'Current Year', description: 'The current calendar year', required: true, type: 'integer' },
      { name: 'minimumAge', label: 'Minimum Age', description: 'Required minimum age in years', required: true, type: 'integer' },
    ],
  },

  'balance-proof': {
    id: 'balance-proof',
    name: 'Balance Proof',
    description: 'Prove your balance exceeds a threshold without revealing the exact amount',
    category: 'financial',
    fields: [
      { name: 'balance', label: 'Balance', description: 'Actual token balance in smallest unit', required: true, type: 'integer' },
      { name: 'minimumBalance', label: 'Minimum Balance', description: 'Required minimum balance threshold', required: true, type: 'integer' },
    ],
  },

  'membership-proof': {
    id: 'membership-proof',
    name: 'Membership Proof',
    description: 'Prove membership in a group via Merkle inclusion without revealing your identity',
    category: 'identity',
    fields: [
      { name: 'memberId', label: 'Member ID', description: 'Private member identifier (field element)', required: true, type: 'hash' },
      { name: 'pathElements', label: 'Path Elements', description: 'Merkle path sibling hashes (array of 16)', required: true, type: 'hash' },
      { name: 'pathIndices', label: 'Path Indices', description: 'Merkle path direction bits (array of 16)', required: true, type: 'hash' },
      { name: 'root', label: 'Merkle Root', description: 'Published Merkle root of the membership group', required: true, type: 'hash' },
    ],
  },

  'range-proof': {
    id: 'range-proof',
    name: 'Range Proof',
    description: 'Prove a value falls within a specified range without revealing it',
    category: 'financial',
    fields: [
      { name: 'value', label: 'Value', description: 'The private value to prove is in range', required: true, type: 'integer' },
      { name: 'minRange', label: 'Minimum', description: 'Lower bound of the accepted range (inclusive)', required: true, type: 'integer' },
      { name: 'maxRange', label: 'Maximum', description: 'Upper bound of the accepted range (inclusive)', required: true, type: 'integer' },
    ],
  },

  'private-voting': {
    id: 'private-voting',
    name: 'Private Voting',
    description: 'Cast a verifiable vote without revealing your identity or choice publicly',
    category: 'governance',
    fields: [
      { name: 'voterId', label: 'Voter ID', description: 'Private voter identifier', required: true, type: 'hash' },
      { name: 'voteChoice', label: 'Vote Choice', description: 'Numeric vote option (e.g. 0, 1, 2)', required: true, type: 'integer' },
      { name: 'pollId', label: 'Poll ID', description: 'Identifier for the poll being voted on', required: true, type: 'hash' },
    ],
  },

  'hash-preimage': {
    id: 'hash-preimage',
    name: 'Hash Preimage',
    description: 'Prove knowledge of a hash preimage without revealing it',
    category: 'cryptographic',
    fields: [
      { name: 'preimage', label: 'Preimage', description: 'The secret preimage value', required: true, type: 'hash' },
      { name: 'salt', label: 'Salt', description: 'Random salt added before hashing', required: true, type: 'hash' },
      { name: 'expectedHash', label: 'Expected Hash', description: 'The public hash to verify against', required: true, type: 'hash' },
    ],
  },

  'credential-proof': {
    id: 'credential-proof',
    name: 'Credential Proof',
    description: 'Prove possession of a valid, non-expired credential without exposing its contents',
    category: 'identity',
    fields: [
      { name: 'credentialHash', label: 'Credential Hash', description: 'Hash of the credential data', required: true, type: 'hash' },
      { name: 'credentialSecret', label: 'Credential Secret', description: 'Private key or secret bound to the credential', required: true, type: 'hash' },
      { name: 'validUntil', label: 'Valid Until', description: 'Credential expiry as a Unix timestamp', required: true, type: 'timestamp' },
      { name: 'currentTime', label: 'Current Time', description: 'Current Unix timestamp for expiry check', required: true, type: 'timestamp' },
      { name: 'expectedHash', label: 'Expected Hash', description: 'Public commitment hash to verify credential ownership', required: true, type: 'hash' },
    ],
  },

  'token-swap': {
    id: 'token-swap',
    name: 'Token Swap',
    description: 'Prove eligibility for a token swap without revealing your full balance',
    category: 'financial',
    fields: [
      { name: 'tokenABalance', label: 'Token A Balance', description: 'Current balance of the source token', required: true, type: 'integer' },
      { name: 'swapSecret', label: 'Swap Secret', description: 'Private secret authorising the swap', required: true, type: 'hash' },
      { name: 'requiredTokenA', label: 'Required Token A', description: 'Minimum source-token amount needed', required: true, type: 'integer' },
      { name: 'swapRate', label: 'Swap Rate', description: 'Exchange rate multiplier (integer-scaled)', required: true, type: 'integer' },
      { name: 'minReceive', label: 'Minimum Receive', description: 'Minimum destination tokens to receive', required: true, type: 'integer' },
    ],
  },

  'signature-verification': {
    id: 'signature-verification',
    name: 'Signature Verification',
    description: 'Verify an EdDSA signature inside a zero-knowledge circuit',
    category: 'cryptographic',
    fields: [
      { name: 'R8x', label: 'R8 X', description: 'X coordinate of the signature point R8', required: true, type: 'hash' },
      { name: 'R8y', label: 'R8 Y', description: 'Y coordinate of the signature point R8', required: true, type: 'hash' },
      { name: 'S', label: 'S', description: 'Scalar component of the EdDSA signature', required: true, type: 'hash' },
      { name: 'Ax', label: 'Public Key X', description: 'X coordinate of the signer public key', required: true, type: 'hash' },
      { name: 'Ay', label: 'Public Key Y', description: 'Y coordinate of the signer public key', required: true, type: 'hash' },
      { name: 'M', label: 'Message', description: 'The message that was signed', required: true, type: 'hash' },
    ],
  },

  'patience-proof': {
    id: 'patience-proof',
    name: 'Patience Proof',
    description: 'Prove a minimum waiting period has elapsed without revealing the exact times',
    category: 'cryptographic',
    fields: [
      { name: 'startTime', label: 'Start Time', description: 'Unix timestamp when the wait began', required: true, type: 'timestamp' },
      { name: 'endTime', label: 'End Time', description: 'Unix timestamp when the wait ended', required: true, type: 'timestamp' },
      { name: 'secret', label: 'Secret', description: 'Private secret used in the time-lock commitment', required: true, type: 'hash' },
      { name: 'minimumWaitTime', label: 'Minimum Wait Time', description: 'Required minimum wait duration in seconds', required: true, type: 'integer' },
      { name: 'commitmentHash', label: 'Commitment Hash', description: 'Public commitment hash binding the time-lock', required: true, type: 'hash' },
    ],
  },

  'quadratic-voting': {
    id: 'quadratic-voting',
    name: 'Quadratic Voting',
    description: 'Cast a quadratic vote weighted by token balance without revealing holdings',
    category: 'governance',
    fields: [
      { name: 'voterId', label: 'Voter ID', description: 'Private voter identifier', required: true, type: 'hash' },
      { name: 'tokenBalance', label: 'Token Balance', description: 'Number of governance tokens held', required: true, type: 'integer' },
      { name: 'voteChoice', label: 'Vote Choice', description: 'Numeric vote option', required: true, type: 'integer' },
      { name: 'pollId', label: 'Poll ID', description: 'Identifier for the poll', required: true, type: 'hash' },
      { name: 'minTokens', label: 'Minimum Tokens', description: 'Token threshold required to participate', required: true, type: 'integer' },
    ],
  },

  'nft-ownership': {
    id: 'nft-ownership',
    name: 'NFT Ownership',
    description: 'Prove you own an NFT within a collection without revealing which one',
    category: 'financial',
    fields: [
      { name: 'nftTokenId', label: 'NFT Token ID', description: 'Private token ID of the owned NFT', required: true, type: 'integer' },
      { name: 'ownerSecret', label: 'Owner Secret', description: 'Private key proving ownership', required: true, type: 'hash' },
      { name: 'collectionRoot', label: 'Collection Root', description: 'Merkle root of the NFT collection', required: true, type: 'hash' },
      { name: 'minTokenId', label: 'Min Token ID', description: 'Lower bound of the valid token ID range', required: true, type: 'integer' },
      { name: 'maxTokenId', label: 'Max Token ID', description: 'Upper bound of the valid token ID range', required: true, type: 'integer' },
    ],
  },

  'anonymous-reputation': {
    id: 'anonymous-reputation',
    name: 'Anonymous Reputation',
    description: 'Prove your reputation score exceeds a threshold without revealing your identity or exact score',
    category: 'identity',
    fields: [
      { name: 'userId', label: 'User ID', description: 'Private user identifier', required: true, type: 'hash' },
      { name: 'reputationScore', label: 'Reputation Score', description: 'Actual reputation score', required: true, type: 'integer' },
      { name: 'userNonce', label: 'User Nonce', description: 'Random nonce to prevent linkability across proofs', required: true, type: 'hash' },
      { name: 'thresholdScore', label: 'Threshold Score', description: 'Minimum reputation score required', required: true, type: 'integer' },
      { name: 'platformId', label: 'Platform ID', description: 'Identifier of the platform issuing the score', required: true, type: 'hash' },
    ],
  },
};

export function validateInputs(
  templateId: TemplateId,
  inputs: Record<string, string>,
): { valid: boolean; errors: string[] } {
  const schema = CIRCUIT_SCHEMAS[templateId];
  if (!schema) {
    return { valid: false, errors: [`Unknown template: ${templateId}`] };
  }

  const errors: string[] = [];

  for (const field of schema.fields) {
    const value = inputs[field.name];

    if (field.required && (value === undefined || value === '')) {
      errors.push(`Missing required field: ${field.label} (${field.name})`);
      continue;
    }

    if (value === undefined || value === '') continue;

    if (field.type === 'integer' || field.type === 'timestamp') {
      if (!/^\d+$/.test(value)) {
        errors.push(`${field.label} (${field.name}) must be a non-negative integer`);
      }
    }

    if (field.type === 'hash') {
      if (!/^\d+$/.test(value) && !/^0x[0-9a-fA-F]+$/.test(value)) {
        errors.push(`${field.label} (${field.name}) must be a numeric string or hex value`);
      }
    }
  }

  const knownFields = new Set(schema.fields.map((f) => f.name));
  for (const key of Object.keys(inputs)) {
    if (!knownFields.has(key)) {
      errors.push(`Unknown field: ${key}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
