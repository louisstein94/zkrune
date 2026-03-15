"use client";

import Navigation from "@/components/Navigation";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import { useState } from "react";
import { Node, Edge } from "reactflow";
import CircuitActions from "@/components/circuit-builder/CircuitActions";
import { getRandomTemplate, getAllTemplates } from "@/lib/circuitTemplates";

const featuredTemplateIds = ['age-verification', 'balance-proof', 'password-proof'];

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const allTemplates = getAllTemplates();
  const featuredTemplates = allTemplates.filter(t => featuredTemplateIds.includes(t.id));
  const otherTemplates = allTemplates.filter(t => !featuredTemplateIds.includes(t.id));

  const handleLoad = (loadedNodes: Node[], loadedEdges: Edge[]) => {
    setNodes(loadedNodes);
    setEdges(loadedEdges);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const loadRandomCircuit = () => {
    const template = getRandomTemplate();
    setNodes(template.nodes as Node[]);
    setEdges(template.edges as Edge[]);
    setShowTemplates(false);
  };

  const loadTemplate = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      setNodes(template.nodes as Node[]);
      setEdges(template.edges as Edge[]);
      setShowTemplates(false);
    }
  };

  const hasCircuit = nodes.length > 0;

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-20">
        {/* Compact Header */}
        <div className="px-6 py-3 border-b border-zk-gray/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-hatton text-xl text-white">
                Circuit Builder
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    showTemplates
                      ? 'bg-zk-primary/20 border border-zk-primary/40 text-zk-primary'
                      : 'border border-zk-gray/20 text-zk-gray hover:text-white hover:border-zk-gray/40'
                  }`}
                >
                  Sablonlar
                </button>
                <button
                  onClick={loadRandomCircuit}
                  className="px-3 py-1.5 text-xs border border-zk-accent/20 text-zk-accent/80 rounded-md hover:border-zk-accent/40 hover:text-zk-accent transition-all"
                >
                  Rastgele ornek
                </button>
              </div>
            </div>

            <CircuitActions 
              nodes={nodes} 
              edges={edges} 
              onLoad={handleLoad}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* Template Panel */}
        {showTemplates && (
          <div className="px-6 py-4 bg-zk-dark/80 border-b border-zk-gray/20">
            <div className="max-w-6xl mx-auto">
              {/* Featured */}
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider mb-3">Populer sablonlar</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {featuredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-3 bg-zk-darker border border-zk-primary/20 rounded-lg hover:border-zk-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zk-primary/10 flex items-center justify-center shrink-0 group-hover:bg-zk-primary/20 transition-colors">
                        <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium mb-0.5">{template.name}</p>
                        <p className="text-xs text-zk-gray line-clamp-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Others */}
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider mb-3">Diger sablonlar</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {otherTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-2.5 bg-zk-darker border border-zk-gray/15 rounded-lg hover:border-zk-gray/40 transition-all text-left"
                  >
                    <p className="text-xs text-white font-medium mb-0.5 truncate">{template.name}</p>
                    <p className="text-[10px] text-zk-gray line-clamp-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <CircuitCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
      </div>
    </main>
  );
}

