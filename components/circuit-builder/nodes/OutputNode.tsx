"use client";

import { Handle, Position } from 'reactflow';
import { getBasicIcon } from '../BasicIcons';

export default function OutputNode({ data }: any) {
  const IconComponent = getBasicIcon(data.outputType);

  return (
    <div className="bg-zk-dark border-2 border-zk-accent/50 rounded-xl p-4 min-w-[180px] shadow-lg shadow-zk-accent/10">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zk-accent !border-2 !border-zk-darker !w-3 !h-3"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-zk-accent/20 rounded-lg flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-zk-accent" />
        </div>
        <div>
          <p className="text-xs text-zk-gray uppercase">Output</p>
          <p className="text-sm text-white font-medium">{data.label}</p>
        </div>
      </div>
      
      <div className="mt-2 px-2 py-1 bg-zk-accent/10 rounded text-xs text-zk-accent">
        {data.outputType}
      </div>
    </div>
  );
}

