"use client";

import { useState } from 'react';
import { getAdvancedIcon } from './AdvancedIcons';
import { getBasicIcon } from './BasicIcons';

interface ComponentPaletteProps {
  onAddNode: (type: string, data: any) => void;
}

const components = [
  {
    category: "Girisler",
    description: "Devrenin veri alacagi kaynaklar",
    defaultOpen: true,
    items: [
      { type: "input", label: "Gizli Giris", hint: "Sadece kanıtlayıcı bilir", iconType: "private", data: { label: "Private Value", fieldType: "private" } },
      { type: "input", label: "Acik Giris", hint: "Herkes gorebilir", iconType: "public", data: { label: "Public Value", fieldType: "public" } },
    ],
  },
  {
    category: "Islemler",
    description: "Temel matematik ve karsilastirma",
    defaultOpen: true,
    items: [
      { type: "operation", label: "Topla", hint: "A + B", icon: "+", data: { label: "Add", operation: "add" } },
      { type: "operation", label: "Cikar", hint: "A - B", icon: "-", data: { label: "Subtract", operation: "subtract" } },
      { type: "operation", label: "Carp", hint: "A × B", icon: "×", data: { label: "Multiply", operation: "multiply" } },
      { type: "operation", label: "Buyuktur", hint: "A > B", icon: ">", data: { label: "Greater Than", operation: "gt" } },
      { type: "operation", label: "Kucuktur", hint: "A < B", icon: "<", data: { label: "Less Than", operation: "lt" } },
      { type: "operation", label: "Esittir", hint: "A = B", icon: "=", data: { label: "Equal", operation: "eq" } },
    ],
  },
  {
    category: "Gelismis",
    description: "ZK-ozel kriptografik islemler",
    defaultOpen: false,
    items: [
      { type: "advanced", label: "Aralik Kontrolu", hint: "Deger min-max icerisinde mi?", iconType: "range-check", data: { label: "Range Check", operation: "range-check" } },
      { type: "advanced", label: "Hash", hint: "Poseidon hash fonksiyonu", iconType: "hash", data: { label: "Poseidon Hash", operation: "hash" } },
      { type: "advanced", label: "Kosul", hint: "Eger A ise B yap", iconType: "conditional", data: { label: "IF/THEN", operation: "conditional" } },
      { type: "advanced", label: "Merkle Kaniti", hint: "Bir listenin uyesi mi?", iconType: "merkle-proof", data: { label: "Merkle Proof", operation: "merkle-proof" } },
      { type: "advanced", label: "Mod", hint: "Bolumden kalan", iconType: "modulo", data: { label: "Modulo", operation: "modulo" } },
    ],
  },
  {
    category: "Cikislar",
    description: "Devrenin urettigi sonuclar",
    defaultOpen: true,
    items: [
      { type: "output", label: "Evet/Hayir Sonuc", hint: "true veya false dondurur", iconType: "boolean", data: { label: "Result", outputType: "boolean" } },
      { type: "output", label: "Sayisal Sonuc", hint: "Sayisal bir deger dondurur", iconType: "number", data: { label: "Value", outputType: "number" } },
    ],
  },
];

export default function ComponentPalette({ onAddNode }: ComponentPaletteProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(components.map(c => [c.category, c.defaultOpen]))
  );

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="w-56 bg-zk-dark border-r border-zk-gray/20 flex flex-col">
      <div className="p-4 border-b border-zk-gray/10">
        <h3 className="font-hatton text-base text-white">Bilesenler</h3>
        <p className="text-[11px] text-zk-gray mt-0.5">Tiklayarak ekle</p>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-1">
        {components.map((category) => {
          const isOpen = openCategories[category.category];
          return (
            <div key={category.category}>
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between py-2 px-1 text-left group"
              >
                <div>
                  <span className="text-xs font-medium text-zk-gray uppercase tracking-wider group-hover:text-white transition-colors">
                    {category.category}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-zk-gray/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="space-y-1 pb-2">
                  {category.items.map((item: any) => {
                    const hasSVG = item.iconType;
                    let IconComponent: React.ComponentType<{ className?: string }> | null = null;
                    
                    if (hasSVG) {
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
                        className="w-full p-2.5 bg-zk-darker/50 border border-zk-gray/10 rounded-lg hover:border-zk-primary/40 hover:bg-zk-darker transition-all group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          {hasSVG && IconComponent ? (
                            <div className="w-7 h-7 bg-zk-primary/10 rounded-md flex items-center justify-center group-hover:bg-zk-primary/20 transition-colors shrink-0">
                              <IconComponent className="w-4 h-4 text-zk-primary" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 bg-zk-secondary/10 rounded-md flex items-center justify-center group-hover:bg-zk-secondary/20 transition-colors shrink-0">
                              <span className="text-sm font-bold text-zk-secondary">{item.icon}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate">{item.label}</p>
                            <p className="text-[10px] text-zk-gray/60 truncate">{item.hint}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

