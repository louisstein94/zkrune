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
import { generateCircomCode, validateCircuit, estimateCircuitComplexity } from '@/lib/circuitGenerator';

const nodeTypes: NodeTypes = {
  input: InputNode,
  operation: OperationNode,
  output: OutputNode,
};

interface CircuitCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export default function CircuitCanvas({ 
  initialNodes = [], 
  initialEdges = [],
  onNodesChange: externalNodesChange,
  onEdgesChange: externalEdgesChange,
}: CircuitCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [
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
  ]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges.length > 0 ? initialEdges : [
    { id: 'e1-2', source: 'example-1', target: 'example-2', animated: true },
    { id: 'e2-3', source: 'example-2', target: 'example-3', animated: true },
  ]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

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

  // Update generated code when nodes/edges change
  const updateCode = useCallback(() => {
    const code = generateCircomCode(nodes, edges);
    setGeneratedCode(code);
    
    const validationResult = validateCircuit(nodes, edges);
    setValidation(validationResult);
  }, [nodes, edges]);

  // Auto-update code
  useCallback(() => {
    updateCode();
  }, [nodes, edges, updateCode]);

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
        <div className="mb-4">
          <h3 className="font-hatton text-xl text-white mb-2">
            Circuit Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zk-gray">Nodes:</span>
              <span className="text-white">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zk-gray">Connections:</span>
              <span className="text-white">{edges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zk-gray">Est. Constraints:</span>
              <span className="text-white">{estimateCircuitComplexity(nodes, edges).constraints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zk-gray">Est. Time:</span>
              <span className="text-white">{estimateCircuitComplexity(nodes, edges).estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Validation */}
        {!validation.valid && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 font-medium mb-2">Validation Errors:</p>
            {validation.errors.map((error, i) => (
              <p key={i} className="text-xs text-red-300">• {error}</p>
            ))}
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-hatton text-lg text-white mb-3">
            Generated Circom
          </h3>
          <div className="bg-zk-darker border border-zk-gray/20 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-zk-gray font-mono whitespace-pre">
              {generatedCode || generateCircomCode(nodes, edges)}
            </pre>
          </div>
        </div>

        <button 
          onClick={() => {
            navigator.clipboard.writeText(generatedCode || generateCircomCode(nodes, edges));
            alert('Code copied!');
          }}
          className="w-full py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm hover:bg-zk-primary/20 transition-all"
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}

