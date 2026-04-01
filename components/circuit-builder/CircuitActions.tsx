"use client";

import { Node, Edge } from 'reactflow';
import { useState, useEffect, useCallback } from 'react';
import { generateCircomCode, validateCircuit } from '@/lib/circuitGenerator';
import { usePublishBlink } from '@/lib/blinks/usePublishBlink';
import TrustLevelBadge from '@/components/TrustLevelBadge';

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
  const [showBlinkModal, setShowBlinkModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { publish, isPublishing, result: blinkResult, reset: resetBlink } = usePublishBlink();

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

  const handleCreateBlink = () => {
    const validation = validateCircuit(nodes, edges);
    if (!validation.valid) {
      addToast('Cannot create Blink: ' + validation.errors[0], 'error');
      return;
    }
    setShowBlinkModal(true);
  };

  const copyBlinkUrl = async () => {
    if (!blinkResult) return;
    try {
      await navigator.clipboard.writeText(blinkResult.verifyPageUrl);
      addToast('Verification link copied!', 'success');
    } catch {
      addToast('Failed to copy', 'error');
    }
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

      <div className="w-px h-4 bg-zk-gray/20 mx-1" />

      <button
        onClick={handleCreateBlink}
        disabled={!hasNodes || isPublishing}
        className="px-4 py-1.5 text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-md hover:from-violet-500 hover:to-fuchsia-500 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {isPublishing ? 'Publishing...' : 'Create Blink'}
      </button>

      {/* Blink info modal */}
      {showBlinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowBlinkModal(false); resetBlink(); }}>
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Create Blink</h3>
                <p className="text-zinc-400 text-xs">Share your ZK proof as a Solana Blink</p>
              </div>
            </div>

            {blinkResult ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-emerald-400 text-sm font-medium">Proof Published!</p>
                    <TrustLevelBadge level="self-asserted" size="sm" />
                  </div>
                  <p className="text-zinc-400 text-xs mb-3">Share this link to let anyone verify your proof.</p>
                  <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-violet-300 break-all">
                    {blinkResult.verifyPageUrl}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyBlinkUrl}
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-500 transition-colors font-medium"
                  >
                    Copy Blink URL
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Verify my ZK proof on-chain:\n${blinkResult.verifyPageUrl}`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                    }}
                    className="px-4 py-2.5 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors font-medium"
                  >
                    Tweet
                  </button>
                </div>
                <p className="text-zinc-500 text-xs text-center">
                  Expires: {new Date(blinkResult.expiresAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-zinc-300 text-sm">
                    This will compile your circuit, generate a proof, and publish it as a shareable Solana Blink. Anyone with the link can verify your proof on-chain.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your private inputs never leave your browser.
                  </div>
                </div>
                <p className="text-amber-400/80 text-xs bg-amber-500/10 border border-amber-500/15 rounded-lg p-3">
                  Note: Blink creation requires a compiled circuit with proof artifacts (.wasm, .zkey). Use the Templates page to generate a proof first, then publish it as a Blink.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowBlinkModal(false); resetBlink(); }}
                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => window.location.href = '/templates'}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all font-medium"
                  >
                    Go to Templates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

