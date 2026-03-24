export interface TemplateParam {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'select';
  label: string;
  description: string;
  required: boolean;
  options?: string[];
  default?: string;
}

export interface TemplateSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  params: TemplateParam[];
  circuitInputKeys: string[];
  examplePrompts: string[];
}

export const TEMPLATE_SPECS: TemplateSpec[] = [
  {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Prove you are 18+ without revealing your exact age or date of birth.',
    category: 'Identity',
    difficulty: 'Easy',
    params: [
      { name: 'birthYear', type: 'number', label: 'Birth Year', description: 'Year of birth (e.g. 1995)', required: true },
      { name: 'currentYear', type: 'number', label: 'Current Year', description: 'Current year', required: true, default: new Date().getFullYear().toString() },
      { name: 'minimumAge', type: 'number', label: 'Minimum Age', description: 'Minimum age to prove (default: 18)', required: true, default: '18' },
    ],
    circuitInputKeys: ['birthYear', 'currentYear', 'minimumAge'],
    examplePrompts: [
      'I want to prove I am over 18',
      'Age verification without showing my birthday',
      'Prove I am old enough to access something',
    ],
  },
  {
    id: 'balance-proof',
    name: 'Balance Proof',
    description: 'Prove you hold a minimum token balance without revealing the exact amount.',
    category: 'Financial',
    difficulty: 'Easy',
    params: [
      { name: 'balance', type: 'number', label: 'Actual Balance', description: 'Your actual token balance (kept private)', required: true },
      { name: 'minimumBalance', type: 'number', label: 'Minimum Balance', description: 'The threshold you want to prove (public)', required: true },
    ],
    circuitInputKeys: ['balance', 'minimumBalance'],
    examplePrompts: [
      'Prove I have more than 10,000 tokens',
      'Show I meet a minimum balance without revealing how much I have',
      'Balance proof without exposing my wallet',
    ],
  },
  {
    id: 'membership-proof',
    name: 'Membership Proof',
    description: 'Prove you are a member of a group without revealing which member you are. Uses a Merkle tree with depth 16 (up to 65,536 members). Demo members available: alice, bob, charlie, diana, eve.',
    category: 'Access',
    difficulty: 'Medium',
    params: [
      { name: 'memberId', type: 'string', label: 'Member ID', description: 'Your member name or identifier. For demo, use one of: alice, bob, charlie, diana, eve', required: true },
    ],
    circuitInputKeys: ['memberId', 'pathElements', 'pathIndices', 'root'],
    examplePrompts: [
      'Prove I belong to a group anonymously',
      'Anonymous membership verification',
      'Show I am in a whitelist without revealing who I am',
    ],
  },
  {
    id: 'range-proof',
    name: 'Range Proof',
    description: 'Prove a value falls within a specific range without revealing the exact value.',
    category: 'Data',
    difficulty: 'Medium',
    params: [
      { name: 'value', type: 'number', label: 'Secret Value', description: 'The value to prove (kept private)', required: true },
      { name: 'minRange', type: 'number', label: 'Minimum', description: 'Lower bound of the range', required: true },
      { name: 'maxRange', type: 'number', label: 'Maximum', description: 'Upper bound of the range', required: true },
    ],
    circuitInputKeys: ['value', 'minRange', 'maxRange'],
    examplePrompts: [
      'Prove my income is between 50K and 100K',
      'Show a value is within a range without the exact number',
      'Range verification for compliance',
    ],
  },
  {
    id: 'private-voting',
    name: 'Private Voting',
    description: 'Cast an anonymous vote with cryptographic proof that your vote is valid. Supports up to 4 vote options (0=Yes, 1=No, 2=Abstain, 3=Other).',
    category: 'Governance',
    difficulty: 'Advanced',
    params: [
      { name: 'voterId', type: 'number', label: 'Voter ID', description: 'Your unique voter identifier (kept private, must be non-zero)', required: true },
      { name: 'voteChoice', type: 'number', label: 'Vote Choice', description: 'Your vote option: 0=Yes, 1=No, 2=Abstain, 3=Other', required: true },
      { name: 'pollId', type: 'number', label: 'Poll ID', description: 'The poll/proposal identifier (public)', required: true },
    ],
    circuitInputKeys: ['voterId', 'voteChoice', 'pollId'],
    examplePrompts: [
      'I want to vote anonymously in a DAO',
      'Secret ballot for governance',
      'Cast a private vote on a proposal',
    ],
  },
  {
    id: 'credential-proof',
    name: 'Credential Verification',
    description: 'Prove you have valid credentials without revealing the credential data. The circuit checks that your credential hash matches the expected hash and that the credential has not expired.',
    category: 'Identity',
    difficulty: 'Medium',
    params: [
      { name: 'credentialHash', type: 'string', label: 'Credential Hash', description: 'Hash of your credential (private)', required: true },
      { name: 'credentialSecret', type: 'number', label: 'Credential Secret', description: 'Your credential secret key (private)', required: true },
      { name: 'validUntil', type: 'number', label: 'Valid Until', description: 'Credential expiration as unix timestamp in seconds (private)', required: true },
      { name: 'currentTime', type: 'number', label: 'Current Time', description: 'Current unix timestamp in seconds (public, auto-filled if omitted)', required: false },
      { name: 'expectedHash', type: 'string', label: 'Expected Hash', description: 'Expected credential hash to verify against (public, defaults to credentialHash)', required: false },
    ],
    circuitInputKeys: ['credentialHash', 'credentialSecret', 'validUntil', 'currentTime', 'expectedHash'],
    examplePrompts: [
      'Prove I have a valid license',
      'Credential verification without showing details',
      'Verify my certificate is not expired',
    ],
  },
  {
    id: 'hash-preimage',
    name: 'Hash Preimage Proof',
    description: 'Prove you know a secret value X where Poseidon(X, salt) = Y, without revealing X. The expected hash is computed automatically from your preimage and salt.',
    category: 'Cryptography',
    difficulty: 'Easy',
    params: [
      { name: 'preimage', type: 'number', label: 'Secret Preimage', description: 'The secret value you want to prove knowledge of (kept private)', required: true },
      { name: 'salt', type: 'number', label: 'Salt', description: 'Random salt for additional security (kept private)', required: true },
    ],
    circuitInputKeys: ['preimage', 'salt', 'expectedHash'],
    examplePrompts: [
      'Prove I know a secret without revealing it',
      'Hash commitment proof',
      'Prove knowledge of a preimage',
    ],
  },
  {
    id: 'quadratic-voting',
    name: 'Quadratic Voting',
    description: 'Fair governance voting with quadratic token weighting to prevent whale dominance. Vote weight scales with token balance. Requires minimum token balance to participate.',
    category: 'Governance',
    difficulty: 'Medium',
    params: [
      { name: 'voterId', type: 'number', label: 'Voter ID', description: 'Your unique voter identifier (private, must be non-zero)', required: true },
      { name: 'tokenBalance', type: 'number', label: 'Token Balance', description: 'Your token balance (private, max 999,999)', required: true },
      { name: 'voteChoice', type: 'number', label: 'Vote Choice', description: 'Your vote option (0-9)', required: true },
      { name: 'pollId', type: 'number', label: 'Poll ID', description: 'Poll identifier (public)', required: true },
      { name: 'minTokens', type: 'number', label: 'Minimum Tokens', description: 'Minimum tokens required to vote (public)', required: true, default: '100' },
    ],
    circuitInputKeys: ['voterId', 'tokenBalance', 'voteChoice', 'pollId', 'minTokens'],
    examplePrompts: [
      'Quadratic voting in a DAO',
      'Fair voting with token weighting',
      'Prevent whale dominance in governance',
    ],
  },
  {
    id: 'nft-ownership',
    name: 'NFT Ownership Proof',
    description: 'Prove you own an NFT from a collection without revealing which specific NFT. Uses Poseidon hash for ownership verification and validates token ID is within the collection range.',
    category: 'NFT',
    difficulty: 'Medium',
    params: [
      { name: 'nftTokenId', type: 'number', label: 'Token ID', description: 'Your NFT token ID (kept private)', required: true },
      { name: 'ownerSecret', type: 'number', label: 'Owner Secret', description: 'Your ownership secret — a private number only you know', required: true },
      { name: 'collectionRoot', type: 'string', label: 'Collection Root', description: 'Poseidon hash root of the collection (public). Auto-computed from token ID and secret if omitted.', required: false },
      { name: 'minTokenId', type: 'number', label: 'Min Token ID', description: 'Collection range start (public)', required: true, default: '1' },
      { name: 'maxTokenId', type: 'number', label: 'Max Token ID', description: 'Collection range end, e.g. 10000 (public)', required: true },
    ],
    circuitInputKeys: ['nftTokenId', 'ownerSecret', 'collectionRoot', 'minTokenId', 'maxTokenId'],
    examplePrompts: [
      'Prove I own an NFT without showing which one',
      'Anonymous NFT holder verification',
      'NFT-gated access proof',
    ],
  },
  {
    id: 'anonymous-reputation',
    name: 'Anonymous Reputation',
    description: 'Prove your reputation score meets a threshold without revealing your identity or exact score. Score must be between 0 and 1000.',
    category: 'Social',
    difficulty: 'Medium',
    params: [
      { name: 'userId', type: 'number', label: 'User ID', description: 'Your unique user identifier (private, must be non-zero)', required: true },
      { name: 'reputationScore', type: 'number', label: 'Reputation Score', description: 'Your actual reputation score, 0-1000 (private)', required: true },
      { name: 'userNonce', type: 'number', label: 'User Nonce', description: 'Random nonce for additional privacy', required: true },
      { name: 'thresholdScore', type: 'number', label: 'Threshold Score', description: 'Minimum score to prove (public)', required: true },
      { name: 'platformId', type: 'number', label: 'Platform ID', description: 'Platform or system identifier (public)', required: true },
    ],
    circuitInputKeys: ['userId', 'reputationScore', 'userNonce', 'thresholdScore', 'platformId'],
    examplePrompts: [
      'Prove my reputation is high enough',
      'Anonymous credit score verification',
      'Show I meet a reputation threshold',
    ],
  },
  {
    id: 'whale-holder',
    name: 'Whale Holder Verification',
    description: 'Prove you are a major token holder (whale) without revealing your wallet or exact balance. This is a Merkle-based circuit requiring a snapshot tree. For full proof generation, use the zkRune SDK or CLI.',
    category: 'Financial',
    difficulty: 'Advanced',
    params: [
      { name: 'balance', type: 'number', label: 'Token Balance', description: 'Your token balance in whole units (private)', required: true },
      { name: 'minimumBalance', type: 'number', label: 'Whale Threshold', description: 'Minimum to qualify as whale (public)', required: true, default: '10000' },
    ],
    circuitInputKeys: ['address', 'balance', 'pathElements', 'pathIndices', 'nullifierSecret', 'root', 'minimumBalance'],
    examplePrompts: [
      'Prove I am a whale holder',
      'Show I hold a large amount of tokens',
      'Whale verification without exposing my wallet',
    ],
  },
  {
    id: 'token-swap',
    name: 'Token Swap Proof',
    description: 'Prove you have sufficient balance for a token swap without revealing exact holdings. Validates that tokenABalance >= requiredTokenA and that the swap meets minimum receive requirements.',
    category: 'Financial',
    difficulty: 'Medium',
    params: [
      { name: 'tokenABalance', type: 'number', label: 'Token A Balance', description: 'Your balance of token A (private)', required: true },
      { name: 'swapSecret', type: 'number', label: 'Swap Secret', description: 'Authorization secret for the swap (private)', required: true },
      { name: 'requiredTokenA', type: 'number', label: 'Required Token A', description: 'Amount of token A needed for swap (public)', required: true },
      { name: 'swapRate', type: 'number', label: 'Swap Rate', description: 'Exchange rate scaled by 1000, e.g. 1500 = 1.5x (public)', required: true, default: '1500' },
      { name: 'minReceive', type: 'number', label: 'Minimum Receive', description: 'Minimum amount of token B to receive (public)', required: true },
    ],
    circuitInputKeys: ['tokenABalance', 'swapSecret', 'requiredTokenA', 'swapRate', 'minReceive'],
    examplePrompts: [
      'Prove I can make a token swap',
      'DEX swap eligibility proof',
      'Show I have enough tokens for a swap',
    ],
  },
  {
    id: 'signature-verification',
    name: 'Signature Verification',
    description: 'Verify an EdDSA-Poseidon digital signature without revealing the private key. Requires signature components (R8x, R8y, S) generated off-circuit using circomlib eddsa.js. This is an advanced circuit for cryptographic applications.',
    category: 'Cryptography',
    difficulty: 'Advanced',
    params: [
      { name: 'R8x', type: 'string', label: 'Signature R8x', description: 'R8 point x-coordinate from EdDSA signature (private)', required: true },
      { name: 'R8y', type: 'string', label: 'Signature R8y', description: 'R8 point y-coordinate from EdDSA signature (private)', required: true },
      { name: 'S', type: 'string', label: 'Signature S', description: 'Scalar component from EdDSA signature (private)', required: true },
      { name: 'Ax', type: 'string', label: 'Public Key Ax', description: 'Signer public key x-coordinate (public)', required: true },
      { name: 'Ay', type: 'string', label: 'Public Key Ay', description: 'Signer public key y-coordinate (public)', required: true },
      { name: 'M', type: 'string', label: 'Message', description: 'Message as a field element (public)', required: true },
    ],
    circuitInputKeys: ['R8x', 'R8y', 'S', 'Ax', 'Ay', 'M'],
    examplePrompts: [
      'Verify a signature without exposing my key',
      'Digital signature proof',
      'EdDSA signature verification',
    ],
  },
  {
    id: 'patience-proof',
    name: 'Patience Proof',
    description: 'Prove you waited a certain time period without revealing exact timing. The commitment hash is computed automatically from your start time and secret.',
    category: 'Cryptography',
    difficulty: 'Medium',
    params: [
      { name: 'startTime', type: 'number', label: 'Start Time', description: 'When waiting started as unix timestamp (private)', required: true },
      { name: 'endTime', type: 'number', label: 'End Time', description: 'When waiting ended as unix timestamp (private)', required: true },
      { name: 'secret', type: 'number', label: 'Secret', description: 'Secret used for the commitment (private)', required: true },
      { name: 'minimumWaitTime', type: 'number', label: 'Minimum Wait Time', description: 'Required minimum wait time in seconds (public)', required: true, default: '3600' },
    ],
    circuitInputKeys: ['startTime', 'endTime', 'secret', 'minimumWaitTime', 'commitmentHash'],
    examplePrompts: [
      'Prove I waited long enough',
      'Time-locked reward proof',
      'Patience verification',
    ],
  },
];

export function findTemplateById(id: string): TemplateSpec | undefined {
  return TEMPLATE_SPECS.find(t => t.id === id);
}
