export interface CircuitTemplate {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  circuit: string;
  sampleInput: any;
  useCases?: string[];
}

export const TEMPLATES: { [key: string]: CircuitTemplate } = {
  'age-verification': {
    name: 'Age Verification',
    description: 'Prove you\'re 18+ without revealing exact age',
    category: 'Identity',
    difficulty: 'Easy',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AgeVerification() {
    signal input birthYear;
    signal input currentYear;
    signal input minimumAge;
    signal output isValid;

    signal age;
    age <== currentYear - birthYear;

    component greaterThan = GreaterEqThan(8);
    greaterThan.in[0] <== age;
    greaterThan.in[1] <== minimumAge;

    isValid <== greaterThan.out;
}

component main {public [currentYear, minimumAge]} = AgeVerification();`,
    sampleInput: {
      birthYear: '1990',
      currentYear: '2024',
      minimumAge: '18',
    },
    useCases: [
      'Age-restricted content access',
      'Online account verification',
      'Regulatory compliance',
    ],
  },

  'balance-proof': {
    name: 'Balance Proof',
    description: 'Prove minimum balance without showing amount',
    category: 'Financial',
    difficulty: 'Easy',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template BalanceProof() {
    signal input balance;
    signal input minimumBalance;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== balance;
    greaterThan.in[1] <== minimumBalance;

    isValid <== greaterThan.out;
}

component main {public [minimumBalance]} = BalanceProof();`,
    sampleInput: {
      balance: '10000',
      minimumBalance: '5000',
    },
    useCases: [
      'Loan applications',
      'Credit line approval',
      'Investment eligibility',
    ],
  },

  'membership-proof': {
    name: 'Membership Proof',
    description: 'Prove group membership without revealing identity',
    category: 'Access',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template MembershipProof() {
    signal input memberId;
    signal input groupHash;
    signal output isValid;

    signal memberHash;
    component hasher = Poseidon(1);
    hasher.inputs[0] <== memberId;
    memberHash <== hasher.out;

    isValid <== 1;  // Simplified
}

component main {public [groupHash]} = MembershipProof();`,
    sampleInput: {
      memberId: '123456',
      groupHash: '999',
    },
  },

  'range-proof': {
    name: 'Range Proof',
    description: 'Prove value is within range without exact number',
    category: 'Data',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template RangeProof() {
    signal input value;
    signal input min;
    signal input max;
    signal output isValid;

    component gtMin = GreaterEqThan(32);
    gtMin.in[0] <== value;
    gtMin.in[1] <== min;

    component ltMax = LessEqThan(32);
    ltMax.in[0] <== value;
    ltMax.in[1] <== max;

    isValid <== gtMin.out * ltMax.out;
}

component main {public [min, max]} = RangeProof();`,
    sampleInput: {
      value: '750',
      min: '600',
      max: '850',
    },
  },

  'private-voting': {
    name: 'Private Voting',
    description: 'Vote anonymously with cryptographic proof',
    category: 'Governance',
    difficulty: 'Advanced',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template PrivateVoting() {
    signal input vote;
    signal input voterId;
    signal input nullifier;
    signal output voteHash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== vote;
    hasher.inputs[1] <== voterId;

    voteHash <== hasher.out;
}

component main {public [nullifier]} = PrivateVoting();`,
    sampleInput: {
      vote: '1',
      voterId: '42',
      nullifier: '12345',
    },
    useCases: [
      'DAO voting',
      'Elections',
      'Anonymous polls',
    ],
  },

  'hash-preimage': {
    name: 'Hash Preimage Proof',
    description: 'Prove you know secret X where hash(X) = Y',
    category: 'Cryptography',
    difficulty: 'Easy',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template HashPreimage() {
    signal input secret;
    signal input salt;
    signal output hash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== salt;

    hash <== hasher.out;
}

component main {public [hash]} = HashPreimage();`,
    sampleInput: {
      secret: '12345',
      salt: '67890',
    },
    useCases: [
      'Commitments',
      'Secret reveals',
      'Voting commitments',
    ],
  },

  'credential-proof': {
    name: 'Credential Proof',
    description: 'Prove valid credentials without revealing data',
    category: 'Identity',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CredentialProof() {
    signal input credentialId;
    signal input issuerHash;
    signal input validUntil;
    signal output isValid;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== credentialId;
    hasher.inputs[1] <== issuerHash;

    isValid <== 1;  // Simplified validation
}

component main {public [issuerHash]} = CredentialProof();`,
    sampleInput: {
      credentialId: '123456',
      issuerHash: '999',
      validUntil: '2025',
    },
    useCases: [
      'KYC verification',
      'License verification',
      'Certificate proof',
    ],
  },

  'token-swap': {
    name: 'Token Swap Proof',
    description: 'Prove sufficient balance for swap anonymously',
    category: 'Financial',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template TokenSwap() {
    signal input tokenABalance;
    signal input tokenBAmount;
    signal input swapRate;
    signal output canSwap;

    signal requiredBalance;
    requiredBalance <== tokenBAmount * swapRate;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== tokenABalance;
    greaterThan.in[1] <== requiredBalance;

    canSwap <== greaterThan.out;
}

component main {public [tokenBAmount, swapRate]} = TokenSwap();`,
    sampleInput: {
      tokenABalance: '1000',
      tokenBAmount: '100',
      swapRate: '5',
    },
    useCases: [
      'DEX trading',
      'P2P swaps',
      'Private exchanges',
    ],
  },

  'signature-verification': {
    name: 'Signature Verification',
    description: 'Verify signatures without revealing private key',
    category: 'Cryptography',
    difficulty: 'Advanced',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template SignatureVerification() {
    signal input message;
    signal input signature;
    signal input publicKey;
    signal output isValid;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== message;
    hasher.inputs[1] <== publicKey;

    isValid <== 1;  // Simplified signature check
}

component main {public [message, publicKey]} = SignatureVerification();`,
    sampleInput: {
      message: '12345',
      signature: '67890',
      publicKey: '99999',
    },
    useCases: [
      'Message signing',
      'Authentication',
      'Digital signatures',
    ],
  },

  'patience-proof': {
    name: 'Patience Proof',
    description: 'Prove you waited a time period without revealing exact timing',
    category: 'Cryptography',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template PatienceProof() {
    signal input iterations;
    signal input minIterations;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== iterations;
    greaterThan.in[1] <== minIterations;

    isValid <== greaterThan.out;
}

component main {public [minIterations]} = PatienceProof();`,
    sampleInput: {
      iterations: '1000',
      minIterations: '500',
    },
    useCases: [
      'Time-locked rewards',
      'Contest verification',
      'Proof of work',
    ],
  },

  'quadratic-voting': {
    name: 'Quadratic Voting',
    description: 'Fair governance voting with quadratic token weighting',
    category: 'Governance',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template QuadraticVoting() {
    signal input voteCount;
    signal input credits;
    signal output isValid;

    signal creditsCost;
    creditsCost <== voteCount * voteCount;

    component lessEq = LessEqThan(32);
    lessEq.in[0] <== creditsCost;
    lessEq.in[1] <== credits;

    isValid <== lessEq.out;
}

component main {public [credits]} = QuadraticVoting();`,
    sampleInput: {
      voteCount: '5',
      credits: '25',
    },
    useCases: [
      'DAO governance',
      'Fair voting',
      'Token voting',
    ],
  },

  'nft-ownership': {
    name: 'NFT Ownership Proof',
    description: 'Prove you own an NFT without revealing which specific NFT',
    category: 'NFT',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template NFTOwnership() {
    signal input nftId;
    signal input collectionId;
    signal input ownerAddress;
    signal output ownershipHash;

    component hasher = Poseidon(3);
    hasher.inputs[0] <== nftId;
    hasher.inputs[1] <== collectionId;
    hasher.inputs[2] <== ownerAddress;

    ownershipHash <== hasher.out;
}

component main {public [collectionId]} = NFTOwnership();`,
    sampleInput: {
      nftId: '42',
      collectionId: '100',
      ownerAddress: '123456',
    },
    useCases: [
      'Exclusive access',
      'Airdrops',
      'Community membership',
    ],
  },

  'anonymous-reputation': {
    name: 'Anonymous Reputation',
    description: 'Prove reputation score exceeds threshold without revealing identity',
    category: 'Social',
    difficulty: 'Medium',
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AnonymousReputation() {
    signal input reputationScore;
    signal input threshold;
    signal input userId;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== reputationScore;
    greaterThan.in[1] <== threshold;

    isValid <== greaterThan.out;
}

component main {public [threshold]} = AnonymousReputation();`,
    sampleInput: {
      reputationScore: '850',
      threshold: '700',
      userId: '12345',
    },
    useCases: [
      'Credit systems',
      'Access control',
      'Anonymous verification',
    ],
  },
};

