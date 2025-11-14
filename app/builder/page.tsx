"use client";

import Navigation from "@/components/Navigation";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import { useState } from "react";
import { Node, Edge } from "reactflow";
import CircuitActions from "@/components/circuit-builder/CircuitActions";
import { getRandomTemplate, getAllTemplates } from "@/lib/circuitTemplates";

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

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
    const templates = getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNodes(template.nodes as Node[]);
      setEdges(template.edges as Edge[]);
      setShowTemplates(false);
    }
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zk-gray/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-hatton text-3xl text-white mb-1">
                Visual Circuit Builder
              </h1>
              <p className="text-sm text-zk-gray">
                Design custom zero-knowledge circuits with drag & drop
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm"
              >
                Templates
              </button>
              <button
                onClick={loadRandomCircuit}
                className="px-4 py-2 bg-zk-accent/20 border border-zk-accent/30 text-zk-accent rounded-lg hover:bg-zk-accent/30 transition-all text-sm font-medium"
              >
                Random Example
              </button>
              <CircuitActions 
                nodes={nodes} 
                edges={edges} 
                onLoad={handleLoad}
                onClear={handleClear}
              />
            </div>
          </div>
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="px-8 py-4 bg-zk-dark/50 border-b border-zk-gray/20">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-zk-gray mb-3">Choose a template to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {getAllTemplates().map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-3 bg-zk-darker border border-zk-gray/20 rounded-lg hover:border-zk-primary/50 transition-all text-left"
                  >
                    <p className="text-sm text-white font-medium mb-1">{template.name}</p>
                    <p className="text-xs text-zk-gray line-clamp-2">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Circuit Builder */}
        <CircuitCanvas initialNodes={nodes} initialEdges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} />
      </div>
    </main>
  );
}

