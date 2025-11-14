"use client";

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ComponentPalette from './ComponentPalette';
import InputNode from './nodes/InputNode';
import OperationNode from './nodes/OperationNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes: NodeTypes = {
  input: InputNode,
  operation: OperationNode,
  output: OutputNode,
};

const initialNodes: Node[] = [
  {
    id: 'example-1',
    type: 'input',
    position: { x: 100, y: 100 },
    data: { label: 'Birth Year', fieldType: 'private' },
  },
  {
    id: 'example-2',
    type: 'operation',
    position: { x: 400, y: 100 },
    data: { label: 'Calculate Age', operation: 'subtract' },
  },
  {
    id: 'example-3',
    type: 'output',
    position: { x: 700, y: 100 },
    data: { label: 'Is 18+', outputType: 'boolean' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'example-1', target: 'example-2', animated: true },
  { id: 'e2-3', source: 'example-2', target: 'example-3', animated: true },
];

export default function CircuitCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const addNode = (type: string, nodeData: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: nodeData,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Component Palette */}
      <ComponentPalette onAddNode={addNode} />

      {/* Canvas */}
      <div className="flex-1 bg-zk-darker">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zk-darker"
        >
          <Background color="#00FFA3" gap={20} size={1} className="opacity-5" />
          <Controls className="bg-zk-dark border border-zk-gray/20 rounded-lg" />
        </ReactFlow>
      </div>

      {/* Code Preview Panel */}
      <div className="w-80 bg-zk-dark border-l border-zk-gray/20 p-6 overflow-auto">
        <h3 className="font-hatton text-xl text-white mb-4">
          Generated Circom
        </h3>
        <div className="bg-zk-darker border border-zk-gray/20 rounded-lg p-4">
          <pre className="text-xs text-zk-gray font-mono">
{`pragma circom 2.0.0;

template CustomCircuit() {
    signal input birthYear;
    signal input currentYear;
    signal output isValid;
    
    signal age;
    age <== currentYear - birthYear;
    
    // Auto-generated from visual builder
    isValid <== 1;
}

component main = CustomCircuit();`}
          </pre>
        </div>

        <button className="w-full mt-4 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm hover:bg-zk-primary/20 transition-all">
          Copy Code
        </button>
      </div>
    </div>
  );
}

