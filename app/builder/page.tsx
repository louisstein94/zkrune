"use client";

import Navigation from "@/components/Navigation";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import { useState } from "react";
import { Node, Edge } from "reactflow";
import CircuitActions from "@/components/circuit-builder/CircuitActions";

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleLoad = (loadedNodes: Node[], loadedEdges: Edge[]) => {
    setNodes(loadedNodes);
    setEdges(loadedEdges);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
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
            
            <CircuitActions 
              nodes={nodes} 
              edges={edges} 
              onLoad={handleLoad}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* Circuit Builder */}
        <CircuitCanvas initialNodes={nodes} initialEdges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} />
      </div>
    </main>
  );
}

