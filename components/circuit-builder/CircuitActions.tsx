"use client";

import { Node, Edge } from 'reactflow';

interface CircuitActionsProps {
  nodes: Node[];
  edges: Edge[];
  onLoad: (nodes: Node[], edges: Edge[]) => void;
  onClear: () => void;
}

export default function CircuitActions({ nodes, edges, onLoad, onClear }: CircuitActionsProps) {
  const saveCircuit = () => {
    const circuit = {
      name: `Circuit-${Date.now()}`,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zkrune-circuit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadCircuit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const circuit = JSON.parse(event.target?.result as string);
          if (circuit.nodes && circuit.edges) {
            onLoad(circuit.nodes, circuit.edges);
          } else {
            alert('Invalid circuit file');
          }
        } catch (error) {
          alert('Failed to load circuit');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const clearCircuit = () => {
    if (confirm('Clear all nodes and start fresh?')) {
      onClear();
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={loadCircuit}
        className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm"
      >
        Load Circuit
      </button>
      <button
        onClick={saveCircuit}
        className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm"
      >
        Save Circuit
      </button>
      <button
        onClick={clearCircuit}
        className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:border-red-500 transition-all text-sm"
      >
        Clear All
      </button>
      <button className="px-4 py-2 bg-zk-secondary/20 border border-zk-secondary/30 text-zk-secondary rounded-lg hover:bg-zk-secondary/30 transition-all text-sm">
        Test Circuit
      </button>
      <button className="px-4 py-2 bg-zk-primary text-zk-darker rounded-lg hover:bg-zk-primary/90 transition-all text-sm font-medium">
        Compile & Deploy
      </button>
    </div>
  );
}

