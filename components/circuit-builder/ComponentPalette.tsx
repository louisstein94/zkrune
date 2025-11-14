"use client";

import { getAdvancedIcon } from './AdvancedIcons';
import { getBasicIcon } from './BasicIcons';

interface ComponentPaletteProps {
  onAddNode: (type: string, data: any) => void;
}

export default function ComponentPalette({ onAddNode }: ComponentPaletteProps) {
  const components = [
    {
      category: "Inputs",
      items: [
        { type: "input", label: "Private Input", iconType: "private", data: { label: "Private Value", fieldType: "private" } },
        { type: "input", label: "Public Input", iconType: "public", data: { label: "Public Value", fieldType: "public" } },
      ],
    },
    {
      category: "Basic Operations",
      items: [
        { type: "operation", label: "Add", icon: "+", data: { label: "Add", operation: "add" } },
        { type: "operation", label: "Subtract", icon: "-", data: { label: "Subtract", operation: "subtract" } },
        { type: "operation", label: "Multiply", icon: "×", data: { label: "Multiply", operation: "multiply" } },
        { type: "operation", label: "Compare >", icon: ">", data: { label: "Greater Than", operation: "gt" } },
        { type: "operation", label: "Compare <", icon: "<", data: { label: "Less Than", operation: "lt" } },
        { type: "operation", label: "Equal", icon: "=", data: { label: "Equal", operation: "eq" } },
      ],
    },
    {
      category: "Advanced",
      items: [
        { type: "advanced", label: "Range Check", iconType: "range-check", data: { label: "Range Check", operation: "range-check" } },
        { type: "advanced", label: "Hash", iconType: "hash", data: { label: "Poseidon Hash", operation: "hash" } },
        { type: "advanced", label: "Conditional", iconType: "conditional", data: { label: "IF/THEN", operation: "conditional" } },
        { type: "advanced", label: "Merkle Proof", iconType: "merkle-proof", data: { label: "Merkle Proof", operation: "merkle-proof" } },
        { type: "advanced", label: "Modulo", iconType: "modulo", data: { label: "Modulo", operation: "modulo" } },
      ],
    },
    {
      category: "Outputs",
      items: [
        { type: "output", label: "Boolean Output", iconType: "boolean", data: { label: "Result", outputType: "boolean" } },
        { type: "output", label: "Number Output", iconType: "number", data: { label: "Value", outputType: "number" } },
      ],
    },
  ];

  return (
    <div className="w-64 bg-zk-dark border-r border-zk-gray/20 p-4 overflow-auto">
      <h3 className="font-hatton text-lg text-white mb-4">Components</h3>
      
      <div className="space-y-6">
        {components.map((category) => (
          <div key={category.category}>
            <h4 className="text-xs font-medium text-zk-gray uppercase tracking-wider mb-3">
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.items.map((item: any) => {
                const hasSVG = item.iconType;
                let IconComponent = null;
                
                if (hasSVG) {
                  // Check if it's advanced or basic icon
                  if (['range-check', 'hash', 'conditional', 'merkle-proof', 'modulo'].includes(item.iconType)) {
                    IconComponent = getAdvancedIcon(item.iconType);
                  } else {
                    IconComponent = getBasicIcon(item.iconType);
                  }
                }
                
                return (
                  <button
                    key={item.label}
                    onClick={() => onAddNode(item.type, item.data)}
                    className="w-full p-3 bg-zk-darker border border-zk-gray/20 rounded-lg hover:border-zk-primary/50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      {hasSVG ? (
                        <div className="w-8 h-8 bg-zk-primary/10 rounded-lg flex items-center justify-center group-hover:bg-zk-primary/20 transition-colors">
                          <IconComponent className="w-5 h-5 text-zk-primary" />
                        </div>
                      ) : (
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">{item.label}</p>
                        <p className="text-xs text-zk-gray">{item.type}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-zk-secondary/10 border border-zk-secondary/20 rounded-lg">
        <p className="text-xs text-zk-gray leading-relaxed">
          💡 Drag components onto canvas and connect them to build your circuit
        </p>
      </div>
    </div>
  );
}

