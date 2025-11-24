import { Node, Edge } from 'reactflow';

export const circuitTemplates = {
  'age-verification': {
    name: 'Age Verification (18+)',
    description: 'Prove you are over 18 without revealing exact age',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Birth Year', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Current Year', fieldType: 'public' },
      },
      {
        id: '3',
        type: 'operation',
        position: { x: 350, y: 150 },
        data: { label: 'Calculate Age', operation: 'subtract' },
      },
      {
        id: '4',
        type: 'operation',
        position: { x: 600, y: 150 },
        data: { label: 'Age >= 18', operation: 'gt' },
      },
      {
        id: '5',
        type: 'output',
        position: { x: 850, y: 150 },
        data: { label: 'Is Adult', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-3', source: '2', target: '3', animated: true },
      { id: 'e2-3', source: '1', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
  },

  'balance-proof': {
    name: 'Balance Proof',
    description: 'Prove sufficient balance without revealing exact amount',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Your Balance', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Required Minimum', fieldType: 'public' },
      },
      {
        id: '3',
        type: 'operation',
        position: { x: 400, y: 150 },
        data: { label: 'Balance >= Minimum', operation: 'gt' },
      },
      {
        id: '4',
        type: 'output',
        position: { x: 700, y: 150 },
        data: { label: 'Has Sufficient Funds', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },

  'range-verification': {
    name: 'Range Verification',
    description: 'Prove value is within acceptable range',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 150 },
        data: { label: 'Private Value', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'advanced',
        position: { x: 400, y: 150 },
        data: { label: 'Range Check', operation: 'range-check', params: { min: '18', max: '65' } },
      },
      {
        id: '3',
        type: 'output',
        position: { x: 700, y: 150 },
        data: { label: 'In Range', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },

  'hash-commitment': {
    name: 'Hash Commitment',
    description: 'Create cryptographic commitment with Poseidon hash',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Secret Value', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Salt', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'advanced',
        position: { x: 400, y: 150 },
        data: { label: 'Poseidon Hash', operation: 'hash' },
      },
      {
        id: '4',
        type: 'output',
        position: { x: 700, y: 150 },
        data: { label: 'Commitment', outputType: 'number' },
      },
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },

  'merkle-membership': {
    name: 'Merkle Tree Membership',
    description: 'Prove membership in a group without revealing identity',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 150 },
        data: { label: 'Member ID', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'advanced',
        position: { x: 400, y: 150 },
        data: { label: 'Merkle Proof', operation: 'merkle-proof', params: { depth: '20' } },
      },
      {
        id: '3',
        type: 'output',
        position: { x: 700, y: 150 },
        data: { label: 'Is Member', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },

  'credential-proof': {
    name: 'Credential Verification',
    description: 'Prove valid credentials without revealing actual data',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 80 },
        data: { label: 'Credential Hash', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 160 },
        data: { label: 'Credential Secret', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'input',
        position: { x: 100, y: 240 },
        data: { label: 'Valid Until', fieldType: 'private' },
      },
      {
        id: '4',
        type: 'input',
        position: { x: 100, y: 320 },
        data: { label: 'Current Time', fieldType: 'public' },
      },
      {
        id: '5',
        type: 'input',
        position: { x: 100, y: 400 },
        data: { label: 'Expected Hash', fieldType: 'public' },
      },
      {
        id: '6',
        type: 'operation',
        position: { x: 400, y: 200 },
        data: { label: 'Verify Hash', operation: 'equals' },
      },
      {
        id: '7',
        type: 'operation',
        position: { x: 400, y: 300 },
        data: { label: 'Check Expiry', operation: 'gt' },
      },
      {
        id: '8',
        type: 'output',
        position: { x: 700, y: 250 },
        data: { label: 'Is Valid', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-6', source: '1', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e3-7', source: '3', target: '7', animated: true },
      { id: 'e4-7', source: '4', target: '7', animated: true },
      { id: 'e6-8', source: '6', target: '8', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
    ],
  },

  'token-swap': {
    name: 'Token Swap Verification',
    description: 'Prove sufficient balance for token swap without revealing exact amount',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Token A Balance', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Token B Balance', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'input',
        position: { x: 100, y: 300 },
        data: { label: 'Swap Secret', fieldType: 'private' },
      },
      {
        id: '4',
        type: 'input',
        position: { x: 100, y: 400 },
        data: { label: 'Required Token A', fieldType: 'public' },
      },
      {
        id: '5',
        type: 'input',
        position: { x: 100, y: 500 },
        data: { label: 'Swap Rate', fieldType: 'public' },
      },
      {
        id: '6',
        type: 'operation',
        position: { x: 400, y: 250 },
        data: { label: 'Balance Check', operation: 'gt' },
      },
      {
        id: '7',
        type: 'advanced',
        position: { x: 400, y: 400 },
        data: { label: 'Commitment Hash', operation: 'hash' },
      },
      {
        id: '8',
        type: 'output',
        position: { x: 700, y: 250 },
        data: { label: 'Can Swap', outputType: 'boolean' },
      },
      {
        id: '9',
        type: 'output',
        position: { x: 700, y: 400 },
        data: { label: 'Commitment', outputType: 'number' },
      },
    ],
    edges: [
      { id: 'e1-6', source: '1', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e6-8', source: '6', target: '8', animated: true },
      { id: 'e1-7', source: '1', target: '7', animated: true },
      { id: 'e3-7', source: '3', target: '7', animated: true },
      { id: 'e7-9', source: '7', target: '9', animated: true },
    ],
  },

  'signature-verification': {
    name: 'Digital Signature Verification',
    description: 'Verify signature without revealing private key',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Private Key', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Message', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'input',
        position: { x: 100, y: 300 },
        data: { label: 'Nonce', fieldType: 'private' },
      },
      {
        id: '4',
        type: 'input',
        position: { x: 100, y: 400 },
        data: { label: 'Public Key X', fieldType: 'public' },
      },
      {
        id: '5',
        type: 'input',
        position: { x: 100, y: 500 },
        data: { label: 'Expected Message', fieldType: 'public' },
      },
      {
        id: '6',
        type: 'advanced',
        position: { x: 400, y: 200 },
        data: { label: 'Message Hash', operation: 'hash' },
      },
      {
        id: '7',
        type: 'advanced',
        position: { x: 400, y: 350 },
        data: { label: 'Derive Public Key', operation: 'hash' },
      },
      {
        id: '8',
        type: 'operation',
        position: { x: 650, y: 275 },
        data: { label: 'Verify All', operation: 'and' },
      },
      {
        id: '9',
        type: 'output',
        position: { x: 900, y: 275 },
        data: { label: 'Is Valid Signature', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e2-6', source: '2', target: '6', animated: true },
      { id: 'e3-6', source: '3', target: '6', animated: true },
      { id: 'e1-7', source: '1', target: '7', animated: true },
      { id: 'e6-8', source: '6', target: '8', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
      { id: 'e8-9', source: '8', target: '9', animated: true },
    ],
  },

  'patience-proof': {
    name: 'Patience Privacy Proof',
    description: 'Prove you waited a time period without revealing exact timing',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Start Time', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'End Time', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'input',
        position: { x: 100, y: 300 },
        data: { label: 'Secret', fieldType: 'private' },
      },
      {
        id: '4',
        type: 'input',
        position: { x: 100, y: 400 },
        data: { label: 'Min Wait Time', fieldType: 'public' },
      },
      {
        id: '5',
        type: 'operation',
        position: { x: 400, y: 150 },
        data: { label: 'Calculate Duration', operation: 'subtract' },
      },
      {
        id: '6',
        type: 'operation',
        position: { x: 400, y: 300 },
        data: { label: 'Check Duration', operation: 'gt' },
      },
      {
        id: '7',
        type: 'advanced',
        position: { x: 650, y: 200 },
        data: { label: 'Commitment Hash', operation: 'hash' },
      },
      {
        id: '8',
        type: 'output',
        position: { x: 900, y: 200 },
        data: { label: 'Is Valid', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-5', source: '1', target: '5', animated: true },
      { id: 'e2-5', source: '2', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e6-7', source: '6', target: '7', animated: true },
      { id: 'e3-7', source: '3', target: '7', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
    ],
  },

  'hash-preimage': {
    name: 'Hash Preimage Proof',
    description: 'Prove you know secret X where hash(X) = Y without revealing X',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: 'Preimage (Secret)', fieldType: 'private' },
      },
      {
        id: '2',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'Salt', fieldType: 'private' },
      },
      {
        id: '3',
        type: 'input',
        position: { x: 100, y: 300 },
        data: { label: 'Expected Hash', fieldType: 'public' },
      },
      {
        id: '4',
        type: 'advanced',
        position: { x: 400, y: 150 },
        data: { label: 'Poseidon Hash', operation: 'hash' },
      },
      {
        id: '5',
        type: 'operation',
        position: { x: 650, y: 200 },
        data: { label: 'Verify Match', operation: 'equals' },
      },
      {
        id: '6',
        type: 'output',
        position: { x: 900, y: 200 },
        data: { label: 'Is Valid', outputType: 'boolean' },
      },
    ],
    edges: [
      { id: 'e1-4', source: '1', target: '4', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },

  'quadratic-voting': {
    name: 'Quadratic Voting',
    description: 'Fair governance voting with quadratic token weighting',
    nodes: [
      { id: '1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'Voter ID', fieldType: 'private' } },
      { id: '2', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Token Balance', fieldType: 'private' } },
      { id: '3', type: 'input', position: { x: 100, y: 300 }, data: { label: 'Vote Choice (0-9)', fieldType: 'private' } },
      { id: '4', type: 'input', position: { x: 100, y: 400 }, data: { label: 'Poll ID', fieldType: 'public' } },
      { id: '5', type: 'input', position: { x: 100, y: 500 }, data: { label: 'Min Tokens', fieldType: 'public' } },
      { id: '6', type: 'operation', position: { x: 400, y: 150 }, data: { label: 'Check Eligibility', operation: 'gte' } },
      { id: '7', type: 'operation', position: { x: 400, y: 350 }, data: { label: 'Calculate Weight', operation: 'quadratic' } },
      { id: '8', type: 'operation', position: { x: 650, y: 250 }, data: { label: 'Hash Vote', operation: 'poseidon' } },
      { id: '9', type: 'output', position: { x: 900, y: 200 }, data: { label: 'Vote Commitment', outputType: 'hash' } },
      { id: '10', type: 'output', position: { x: 900, y: 300 }, data: { label: 'Can Vote', outputType: 'boolean' } },
    ],
    edges: [
      { id: 'e2-6', source: '2', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e2-7', source: '2', target: '7', animated: true },
      { id: 'e1-8', source: '1', target: '8', animated: true },
      { id: 'e3-8', source: '3', target: '8', animated: true },
      { id: 'e4-8', source: '4', target: '8', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
      { id: 'e8-9', source: '8', target: '9', animated: true },
      { id: 'e6-10', source: '6', target: '10', animated: true },
    ],
  },

  'nft-ownership': {
    name: 'NFT Ownership Proof',
    description: 'Prove NFT ownership without revealing which NFT',
    nodes: [
      { id: '1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'NFT Token ID', fieldType: 'private' } },
      { id: '2', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Owner Secret', fieldType: 'private' } },
      { id: '3', type: 'input', position: { x: 100, y: 300 }, data: { label: 'Collection Root', fieldType: 'public' } },
      { id: '4', type: 'input', position: { x: 100, y: 400 }, data: { label: 'Min Token ID', fieldType: 'public' } },
      { id: '5', type: 'input', position: { x: 100, y: 500 }, data: { label: 'Max Token ID', fieldType: 'public' } },
      { id: '6', type: 'operation', position: { x: 400, y: 150 }, data: { label: 'Range Check', operation: 'between' } },
      { id: '7', type: 'operation', position: { x: 400, y: 350 }, data: { label: 'Hash Ownership', operation: 'poseidon' } },
      { id: '8', type: 'operation', position: { x: 650, y: 250 }, data: { label: 'Verify Collection', operation: 'equals' } },
      { id: '9', type: 'output', position: { x: 900, y: 200 }, data: { label: 'Ownership Proof', outputType: 'hash' } },
      { id: '10', type: 'output', position: { x: 900, y: 300 }, data: { label: 'Is Valid', outputType: 'boolean' } },
    ],
    edges: [
      { id: 'e1-6', source: '1', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e1-7', source: '1', target: '7', animated: true },
      { id: 'e2-7', source: '2', target: '7', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
      { id: 'e3-8', source: '3', target: '8', animated: true },
      { id: 'e7-9', source: '7', target: '9', animated: true },
      { id: 'e8-10', source: '8', target: '10', animated: true },
    ],
  },

  'anonymous-reputation': {
    name: 'Anonymous Reputation',
    description: 'Prove reputation score without revealing identity',
    nodes: [
      { id: '1', type: 'input', position: { x: 100, y: 100 }, data: { label: 'User ID', fieldType: 'private' } },
      { id: '2', type: 'input', position: { x: 100, y: 200 }, data: { label: 'Reputation Score', fieldType: 'private' } },
      { id: '3', type: 'input', position: { x: 100, y: 300 }, data: { label: 'User Nonce', fieldType: 'private' } },
      { id: '4', type: 'input', position: { x: 100, y: 400 }, data: { label: 'Threshold Score', fieldType: 'public' } },
      { id: '5', type: 'input', position: { x: 100, y: 500 }, data: { label: 'Platform ID', fieldType: 'public' } },
      { id: '6', type: 'operation', position: { x: 400, y: 150 }, data: { label: 'Check Threshold', operation: 'gte' } },
      { id: '7', type: 'operation', position: { x: 400, y: 300 }, data: { label: 'Calculate Category', operation: 'range' } },
      { id: '8', type: 'operation', position: { x: 650, y: 250 }, data: { label: 'Anonymous Hash', operation: 'poseidon' } },
      { id: '9', type: 'output', position: { x: 900, y: 150 }, data: { label: 'User Commitment', outputType: 'hash' } },
      { id: '10', type: 'output', position: { x: 900, y: 250 }, data: { label: 'Meets Threshold', outputType: 'boolean' } },
      { id: '11', type: 'output', position: { x: 900, y: 350 }, data: { label: 'Score Category', outputType: 'number' } },
    ],
    edges: [
      { id: 'e2-6', source: '2', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e2-7', source: '2', target: '7', animated: true },
      { id: 'e1-8', source: '1', target: '8', animated: true },
      { id: 'e3-8', source: '3', target: '8', animated: true },
      { id: 'e5-8', source: '5', target: '8', animated: true },
      { id: 'e2-8', source: '2', target: '8', animated: true },
      { id: 'e8-9', source: '8', target: '9', animated: true },
      { id: 'e6-10', source: '6', target: '10', animated: true },
      { id: 'e7-11', source: '7', target: '11', animated: true },
    ],
  },
};

export function getRandomTemplate(): { name: string; description: string; nodes: Node[]; edges: Edge[] } {
  const keys = Object.keys(circuitTemplates);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return circuitTemplates[randomKey as keyof typeof circuitTemplates];
}

export function getAllTemplates() {
  return Object.entries(circuitTemplates).map(([key, template]) => ({
    id: key,
    ...template,
  }));
}

