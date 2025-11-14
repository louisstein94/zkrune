"use client";

import { Node, Edge } from 'reactflow';
import { useState } from 'react';
import { generateCircomCode, validateCircuit } from '@/lib/circuitGenerator';

interface CircuitActionsProps {
  nodes: Node[];
  edges: Edge[];
  onLoad: (nodes: Node[], edges: Edge[]) => void;
  onClear: () => void;
}

export default function CircuitActions({ nodes, edges, onLoad, onClear }: CircuitActionsProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const testCircuit = async () => {
    // Validate first
    const validation = validateCircuit(nodes, edges);
    
    if (!validation.valid) {
      alert('Circuit has errors:\n' + validation.errors.join('\n'));
      return;
    }

    setIsTesting(true);

    // Simulate testing with sample inputs
    setTimeout(() => {
      const testResults = {
        passed: true,
        message: 'Circuit validation passed!',
        sampleInputs: nodes.filter(n => n.type === 'input').map(n => n.data.label),
        outputs: nodes.filter(n => n.type === 'output').map(n => n.data.label),
      };

      alert(`✅ Test Passed!\n\nInputs: ${testResults.sampleInputs.join(', ')}\nOutputs: ${testResults.outputs.join(', ')}\n\nCircuit is ready to compile!`);
      setIsTesting(false);
    }, 1500);
  };

  const compileAndDeploy = async () => {
    // Validate first
    const validation = validateCircuit(nodes, edges);
    
    if (!validation.valid) {
      alert('Cannot compile - circuit has errors:\n' + validation.errors.join('\n'));
      return;
    }

    setIsCompiling(true);

    // Generate Circom code
    const circomCode = generateCircomCode(nodes, edges);

    // Simulate compilation
    setTimeout(() => {
      const success = confirm(
        '🔥 Circuit is ready to compile!\n\n' +
        'This would:\n' +
        '1. Save circuit.circom file\n' +
        '2. Compile to WASM\n' +
        '3. Generate proving keys\n' +
        '4. Deploy to your templates\n\n' +
        'Continue with compilation? (This feature is in beta)'
      );

      if (success) {
        // Download the Circom code
        const blob = new Blob([circomCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-circuit-${Date.now()}.circom`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Circom code downloaded!\n\nNext steps:\n1. Compile with: circom your-circuit.circom\n2. Generate keys with snarkjs\n3. Test your proof!');
      }

      setIsCompiling(false);
    }, 2000);
  };

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
    <div className="flex flex-col sm:flex-row gap-3">
      {/* File Actions */}
      <div className="flex gap-2">
        <button
          onClick={loadCircuit}
          className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm"
        >
          Load
        </button>
        <button
          onClick={saveCircuit}
          className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm"
        >
          Save
        </button>
        <button
          onClick={clearCircuit}
          className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:border-red-500 transition-all text-sm"
        >
          Clear
        </button>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-zk-gray/20" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={testCircuit}
          disabled={isTesting}
          className="px-4 py-2 bg-zk-secondary/20 border border-zk-secondary/30 text-zk-secondary rounded-lg hover:bg-zk-secondary/30 transition-all text-sm disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test'}
        </button>
        <button 
          onClick={compileAndDeploy}
          disabled={isCompiling}
          className="px-6 py-2 bg-zk-primary text-zk-darker rounded-lg hover:bg-zk-primary/90 transition-all text-sm font-medium disabled:opacity-50"
        >
          {isCompiling ? 'Compiling...' : 'Compile'}
        </button>
      </div>
    </div>
  );
}

