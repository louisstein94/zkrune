"use client";

interface ComponentPaletteProps {
  onAddNode: (type: string, data: any) => void;
}

export default function ComponentPalette({ onAddNode }: ComponentPaletteProps) {
  const components = [
    {
      category: "Inputs",
      items: [
        { type: "input", label: "Private Input", icon: "🔒", data: { label: "Private Value", fieldType: "private" } },
        { type: "input", label: "Public Input", icon: "🌐", data: { label: "Public Value", fieldType: "public" } },
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
        { type: "advanced", label: "Range Check", icon: "↔️", data: { label: "Range Check", operation: "range-check" } },
        { type: "advanced", label: "Hash", icon: "#️⃣", data: { label: "Poseidon Hash", operation: "hash" } },
        { type: "advanced", label: "Conditional", icon: "⚡", data: { label: "IF/THEN", operation: "conditional" } },
        { type: "advanced", label: "Merkle Proof", icon: "🌳", data: { label: "Merkle Proof", operation: "merkle-proof" } },
        { type: "advanced", label: "Modulo", icon: "%", data: { label: "Modulo", operation: "modulo" } },
      ],
    },
    {
      category: "Outputs",
      items: [
        { type: "output", label: "Boolean Output", icon: "✓", data: { label: "Result", outputType: "boolean" } },
        { type: "output", label: "Number Output", icon: "#", data: { label: "Value", outputType: "number" } },
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
              {category.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onAddNode(item.type, item.data)}
                  className="w-full p-3 bg-zk-darker border border-zk-gray/20 rounded-lg hover:border-zk-primary/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      <p className="text-xs text-zk-gray">{item.type}</p>
                    </div>
                  </div>
                </button>
              ))}
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

