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

