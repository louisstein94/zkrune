"use client";

import { useCallback, useState, useMemo, useRef } from 'react';
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
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ComponentPalette from './ComponentPalette';
import InputNode from './nodes/InputNode';
import OperationNode from './nodes/OperationNode';
import OutputNode from './nodes/OutputNode';
import AdvancedOperationNode from './nodes/AdvancedOperationNode';
import { generateCircomCode, validateCircuit, estimateCircuitComplexity } from '@/lib/circuitGenerator';

const nodeTypes: NodeTypes = {
  input: InputNode,
  operation: OperationNode,
  output: OutputNode,
  advanced: AdvancedOperationNode,
};

interface CircuitCanvasProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

function CircuitCanvasInner({ nodes, edges, setNodes, setEdges }: CircuitCanvasProps) {
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const nodeCountRef = useRef(0);

  const generatedCode = useMemo(
    () => (nodes.length > 0 ? generateCircomCode(nodes, edges) : ''),
    [nodes, edges]
  );

  const validation = useMemo(
    () => (nodes.length > 0 ? validateCircuit(nodes, edges) : { valid: true, errors: [] as string[] }),
    [nodes, edges]
  );

  const complexity = useMemo(
    () => estimateCircuitComplexity(nodes, edges),
    [nodes, edges]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  const addNode = useCallback((type: string, nodeData: any) => {
    const col = nodeCountRef.current % 3;
    const row = Math.floor(nodeCountRef.current / 3);
    nodeCountRef.current += 1;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 200 + col * 280, y: 120 + row * 160 },
      data: nodeData,
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, [generatedCode]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <ComponentPalette onAddNode={addNode} />

      <div className="flex-1 bg-zk-darker relative">
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md pointer-events-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zk-primary/10 border border-zk-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-hatton text-xl text-white mb-2">Start building your circuit</h3>
              <p className="text-sm text-zk-gray mb-4 leading-relaxed">
                Add components from the left panel or choose a ready-made template to get started.
              </p>
              <div className="flex flex-col gap-2 text-xs text-zk-gray/70">
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 rounded bg-zk-primary/20 flex items-center justify-center text-zk-primary font-bold text-[10px]">1</span>
                  <span>Click components to add them</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 rounded bg-zk-primary/20 flex items-center justify-center text-zk-primary font-bold text-[10px]">2</span>
                  <span>Drag handles to connect nodes</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 rounded bg-zk-primary/20 flex items-center justify-center text-zk-primary font-bold text-[10px]">3</span>
                  <span>Compile and download Circom code</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zk-darker"
        >
          <Background color="#6366F1" gap={20} size={1} className="opacity-5" />
          <Controls className="bg-zk-dark border border-zk-gray/20 rounded-lg" />
        </ReactFlow>

        {!isEmpty && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 px-4 py-2 bg-zk-dark/90 backdrop-blur-sm border border-zk-gray/20 rounded-lg text-xs">
              <span className="text-zk-gray">
                <span className="text-white font-medium">{nodes.length}</span> nodes
              </span>
              <span className="w-px h-3 bg-zk-gray/30" />
              <span className="text-zk-gray">
                <span className="text-white font-medium">{edges.length}</span> connections
              </span>
              <span className="w-px h-3 bg-zk-gray/30" />
              <span className="text-zk-gray">
                ~<span className="text-white font-medium">{complexity.constraints}</span> constraint
              </span>
              {!validation.valid && (
                <>
                  <span className="w-px h-3 bg-zk-gray/30" />
                  <span className="text-red-400 font-medium">{validation.errors.length} errors</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowCodePanel(!showCodePanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                showCodePanel
                  ? 'bg-zk-primary text-white'
                  : 'bg-zk-dark/90 backdrop-blur-sm border border-zk-gray/20 text-zk-gray hover:text-white hover:border-zk-primary/50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {showCodePanel ? 'Hide Code' : 'View Code'}
            </button>
          </div>
        )}
      </div>

      {showCodePanel && (
        <div className="w-80 bg-zk-dark border-l border-zk-gray/20 overflow-auto flex flex-col">
          <div className="p-5 border-b border-zk-gray/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-hatton text-base text-white">Circom Code</h3>
              <button
                onClick={() => setShowCodePanel(false)}
                className="text-zk-gray hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!validation.valid && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                {validation.errors.map((error, i) => (
                  <p key={i} className="text-xs text-red-300 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">&#x2022;</span>
                    {error}
                  </p>
                ))}
              </div>
            )}

            {validation.valid && nodes.length > 0 && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
                <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Circuit valid — ready to compile
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-auto">
            <div className="bg-zk-darker border border-zk-gray/20 rounded-lg p-4">
              <pre className="text-xs text-zk-gray font-mono whitespace-pre leading-relaxed">
                {generatedCode || '// Add components to get started...'}
              </pre>
            </div>
          </div>

          <div className="p-4 border-t border-zk-gray/10">
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                codeCopied
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-zk-primary/10 border border-zk-primary/30 text-zk-primary hover:bg-zk-primary/20 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {codeCopied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CircuitCanvas(props: CircuitCanvasProps) {
  return (
    <ReactFlowProvider>
      <CircuitCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
