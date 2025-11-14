"use client";

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { getAdvancedIcon } from '../AdvancedIcons';

export default function AdvancedOperationNode({ data }: any) {
  const [params, setParams] = useState(data.params || {});

  const operationConfigs: { [key: string]: any } = {
    'range-check': {
      color: 'zk-primary',
      params: ['min', 'max'],
      description: 'Check if value is in range'
    },
    'hash': {
      color: 'zk-secondary',
      params: ['inputs'],
      description: 'Poseidon hash function'
    },
    'conditional': {
      color: 'zk-accent',
      params: ['condition'],
      description: 'IF condition THEN result'
    },
    'merkle-proof': {
      color: 'zk-primary',
      params: ['depth'],
      description: 'Merkle tree membership'
    },
    'modulo': {
      color: 'zk-secondary',
      params: ['modulus'],
      description: 'Modulo operation'
    },
  };

  const config = operationConfigs[data.operation] || {
    color: 'zk-gray',
    params: [],
  };

  const IconComponent = getAdvancedIcon(data.operation);

  return (
    <div className={`bg-zk-dark border-2 border-${config.color}/50 rounded-xl p-4 min-w-[220px] shadow-lg shadow-${config.color}/10`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`!bg-${config.color} !border-2 !border-zk-darker !w-3 !h-3`}
        id="input-a"
        style={{ top: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={`!bg-${config.color} !border-2 !border-zk-darker !w-3 !h-3`}
        id="input-b"
        style={{ top: '70%' }}
      />
      
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 bg-${config.color}/20 rounded-lg flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-zk-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-zk-gray uppercase">Advanced</p>
          <p className="text-sm text-white font-medium">{data.label}</p>
        </div>
      </div>

      {/* Parameters */}
      {config.params && config.params.length > 0 && (
        <div className="space-y-2">
          {config.params.map((param: string) => (
            <div key={param} className="flex items-center gap-2">
              <label className="text-xs text-zk-gray w-16">{param}:</label>
              <input
                type="text"
                defaultValue={params[param] || ''}
                onChange={(e) => setParams({ ...params, [param]: e.target.value })}
                className="flex-1 px-2 py-1 bg-zk-darker border border-zk-gray/30 rounded text-xs text-white focus:border-zk-primary focus:outline-none"
                placeholder={`Enter ${param}`}
              />
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-zk-gray opacity-60">
        {config.description}
      </p>
      
      <Handle
        type="source"
        position={Position.Right}
        className={`!bg-${config.color} !border-2 !border-zk-darker !w-3 !h-3`}
      />
    </div>
  );
}

