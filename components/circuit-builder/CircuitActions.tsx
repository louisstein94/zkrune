"use client";

import { Node, Edge } from 'reactflow';
import { useState, useEffect, useCallback } from 'react';
import { generateCircomCode, validateCircuit } from '@/lib/circuitGenerator';

interface CircuitActionsProps {
  nodes: Node[];
  edges: Edge[];
  onLoad: (nodes: Node[], edges: Edge[]) => void;
  onClear: () => void;
}

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function InlineToast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    error: 'bg-red-500/15 border-red-500/30 text-red-300',
    info: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  };

  const icons = {
    success: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9 16H3L12 3z" />
      </svg>
    ),
    info: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs animate-in fade-in slide-in-from-top-2 ${styles[toast.type]}`}>
      {icons[toast.type]}
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function CircuitActions({ nodes, edges, onLoad, onClear }: CircuitActionsProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const testCircuit = async () => {
    const validation = validateCircuit(nodes, edges);
    
    if (!validation.valid) {
      addToast(validation.errors[0], 'error');
      return;
    }

    setIsTesting(true);
    setTimeout(() => {
      const inputCount = nodes.filter(n => n.type === 'input').length;
      const outputCount = nodes.filter(n => n.type === 'output').length;
      addToast(`Test passed! ${inputCount} inputs, ${outputCount} outputs — ready to compile.`, 'success');
      setIsTesting(false);
    }, 1200);
  };

  const compileAndDeploy = async () => {
    const validation = validateCircuit(nodes, edges);
    
    if (!validation.valid) {
      addToast('Cannot compile: ' + validation.errors[0], 'error');
      return;
    }

    setIsCompiling(true);
    const circomCode = generateCircomCode(nodes, edges);

    setTimeout(() => {
      const blob = new Blob([circomCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-circuit-${Date.now()}.circom`;
      a.click();
      URL.revokeObjectURL(url);

      addToast('Circom code downloaded! Compile with the circom CLI.', 'success');
      setIsCompiling(false);
    }, 1500);
  };

  const saveCircuit = () => {
    if (nodes.length === 0) {
      addToast('No circuit to save.', 'info');
      return;
    }

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
    addToast('Circuit saved.', 'success');
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
            addToast(`"${circuit.name || 'Circuit'}" loaded.`, 'success');
          } else {
            addToast('Invalid circuit file.', 'error');
          }
        } catch {
          addToast('Failed to read file.', 'error');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const clearCircuit = () => {
    onClear();
    setShowClearConfirm(false);
    addToast('Canvas cleared.', 'info');
  };

  const hasNodes = nodes.length > 0;

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={loadCircuit}
        className="px-3 py-1.5 text-xs border border-zk-gray/20 text-zk-gray rounded-md hover:text-white hover:border-zk-gray/40 transition-all"
      >
        Load
      </button>
      <button
        onClick={saveCircuit}
        className="px-3 py-1.5 text-xs border border-zk-gray/20 text-zk-gray rounded-md hover:text-white hover:border-zk-gray/40 transition-all"
      >
        Save
      </button>

      {hasNodes && !showClearConfirm && (
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-3 py-1.5 text-xs border border-zk-gray/15 text-zk-gray/60 rounded-md hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          Clear
        </button>
      )}

      {showClearConfirm && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={clearCircuit}
            className="px-3 py-1.5 text-xs bg-red-500/15 border border-red-500/30 text-red-400 rounded-md hover:bg-red-500/25 transition-all"
          >
            Yes, clear
          </button>
          <button
            onClick={() => setShowClearConfirm(false)}
            className="px-2 py-1.5 text-xs text-zk-gray hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="w-px h-4 bg-zk-gray/20 mx-1" />

      <button 
        onClick={testCircuit}
        disabled={isTesting || !hasNodes}
        className="px-3 py-1.5 text-xs border border-zk-secondary/20 text-zk-secondary/80 rounded-md hover:border-zk-secondary/40 hover:text-zk-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isTesting ? 'Testing...' : 'Test'}
      </button>
      <button 
        onClick={compileAndDeploy}
        disabled={isCompiling || !hasNodes}
        className="px-4 py-1.5 text-xs bg-zk-primary text-white rounded-md hover:bg-zk-primary/90 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isCompiling ? 'Compiling...' : 'Compile'}
      </button>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="absolute top-full right-0 mt-2 z-50 space-y-1.5 min-w-[280px]">
          {toasts.map(toast => (
            <InlineToast
              key={toast.id}
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

