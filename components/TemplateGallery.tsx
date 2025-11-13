"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  AgeVerificationIcon, 
  BalanceIcon, 
  MembershipIcon, 
  RangeIcon, 
  VotingIcon 
} from "./TemplateIcons";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  usageCount: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  estimatedTime: string;
}

const templates: Template[] = [
  {
    id: "age-verification",
    name: "Age Verification",
    description: "Prove you're 18+ without revealing your exact age",
    icon: "age",
    category: "Identity",
    usageCount: 1234,
    difficulty: "Easy",
    estimatedTime: "30 sec",
  },
  {
    id: "balance-proof",
    name: "Balance Proof",
    description: "Prove minimum balance without showing amount",
    icon: "balance",
    category: "Financial",
    usageCount: 567,
    difficulty: "Easy",
    estimatedTime: "45 sec",
  },
  {
    id: "membership-proof",
    name: "Membership Proof",
    description: "Prove group membership without revealing identity",
    icon: "membership",
    category: "Access",
    usageCount: 890,
    difficulty: "Medium",
    estimatedTime: "1 min",
  },
  {
    id: "range-proof",
    name: "Range Proof",
    description: "Prove value is within range without exact number",
    icon: "range",
    category: "Data",
    usageCount: 432,
    difficulty: "Medium",
    estimatedTime: "1 min",
  },
  {
    id: "private-voting",
    name: "Private Voting",
    description: "Vote anonymously with cryptographic proof",
    icon: "voting",
    category: "Governance",
    usageCount: 756,
    difficulty: "Advanced",
    estimatedTime: "2 min",
  },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "age": return AgeVerificationIcon;
    case "balance": return BalanceIcon;
    case "membership": return MembershipIcon;
    case "range": return RangeIcon;
    case "voting": return VotingIcon;
    default: return AgeVerificationIcon;
  }
};

export default function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Identity", "Financial", "Access", "Data", "Governance"];

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="relative py-24 px-16" id="templates">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
          <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
          <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
            Ready to Use
          </span>
        </div>

        <h2 className="font-hatton text-5xl text-white mb-4">
          ZK Proof <span className="text-zk-primary">Templates</span>
        </h2>
        <p className="text-xl text-zk-gray max-w-2xl">
          Choose from our curated collection of zero-knowledge proof templates.
          No cryptography knowledge required.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto mb-12">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-3 pl-12 bg-zk-dark/30 border border-zk-gray/30 rounded-full text-white placeholder:text-zk-gray focus:border-zk-primary focus:outline-none transition-colors"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zk-gray">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zk-gray hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                selectedCategory === category
                  ? "bg-zk-primary text-zk-darker shadow-lg shadow-zk-primary/20"
                  : "border border-zk-gray/30 text-zk-gray hover:border-zk-primary hover:text-zk-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto mb-6">
          <p className="text-sm text-zk-gray">
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        </div>
      )}

      {/* Template Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <div
            key={template.id}
            className="group relative bg-gradient-to-br from-zk-dark/50 to-zk-darker/50 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-zk-primary/5 to-zk-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon & Category */}
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-zk-primary/10 rounded-xl border border-zk-primary/20 group-hover:bg-zk-primary/20 transition-colors">
                  {(() => {
                    const IconComponent = getIconComponent(template.icon);
                    return <IconComponent className="w-10 h-10" />;
                  })()}
                </div>
                <span className="text-xs px-3 py-1 bg-zk-secondary/20 text-zk-secondary rounded-full font-medium">
                  {template.category}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-hatton text-2xl text-white mb-2 group-hover:text-zk-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-zk-gray text-sm mb-6 leading-relaxed">
                {template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-zk-gray">Type:</span>
                  <span className="font-medium text-white">
                    Groth16
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      template.difficulty === "Easy"
                        ? "bg-zk-primary/20 text-zk-primary"
                        : template.difficulty === "Medium"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-zk-accent/20 text-zk-accent"
                    }`}
                  >
                    {template.difficulty}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Link href={`/templates/${template.id}`}>
                <button className="w-full py-3 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg font-medium hover:bg-zk-primary hover:text-zk-darker transition-all group-hover:shadow-lg group-hover:shadow-zk-primary/20">
                  Use Template →
                </button>
              </Link>

              {/* Estimated Time */}
              <div className="mt-3 text-center">
                <span className="text-xs text-zk-gray">
                  ⚡ {template.estimatedTime} to complete
                </span>
              </div>
            </div>

            {/* Rune Decoration */}
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">
              ᚱ
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto mt-16 text-center">
        <p className="text-zk-gray mb-4">
          Can't find what you're looking for?
        </p>
        <button className="px-8 py-4 border border-zk-primary/30 text-zk-primary rounded-full font-medium hover:bg-zk-primary hover:text-zk-darker transition-all hover:scale-105">
          Request Custom Template
        </button>
      </div>
    </section>
  );
}

