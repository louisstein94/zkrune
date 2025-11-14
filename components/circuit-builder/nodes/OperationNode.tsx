"use client";

import { Handle, Position } from 'reactflow';

export default function OperationNode({ data }: any) {
  const operationSymbols: { [key: string]: string } = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
    gt: '>',
    lt: '<',
    eq: '=',
  };

  return (
    <div className="bg-zk-dark border-2 border-zk-secondary/50 rounded-xl p-4 min-w-[160px] shadow-lg shadow-zk-secondary/10">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zk-secondary !border-2 !border-zk-darker !w-3 !h-3"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-zk-secondary/20 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-zk-secondary">
            {operationSymbols[data.operation] || '?'}
          </span>
        </div>
        <div>
          <p className="text-xs text-zk-gray uppercase">Operation</p>
          <p className="text-sm text-white font-medium">{data.label}</p>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-zk-secondary !border-2 !border-zk-darker !w-3 !h-3"
      />
    </div>
  );
}

