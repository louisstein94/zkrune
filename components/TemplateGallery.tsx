"use client";

import { useState, useEffect } from "react";
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
  generationTime: string;
  isPopular?: boolean;
  useCase: string;
  hackathonTrack?: "Private Payments" | "Private Launchpads" | "Open Track";
}

interface TemplateGalleryProps {
  highlightTemplateId?: string;
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
    generationTime: "0.44s",
    isPopular: true,
    useCase: "KYC, Age-gated content",
    hackathonTrack: "Open Track",
  },
  {
    id: "balance-proof",
    name: "Balance Proof",
    description: "Prove minimum balance without showing amount",
    icon: "balance",
    category: "Financial",
    usageCount: 892,
    difficulty: "Easy",
    estimatedTime: "45 sec",
    generationTime: "0.41s",
    isPopular: true,
    useCase: "Lending, Financial verification",
    hackathonTrack: "Private Payments",
  },
  {
    id: "membership-proof",
    name: "Membership Proof",
    description: "Prove group membership without revealing identity",
    icon: "membership",
    category: "Access",
    usageCount: 756,
    difficulty: "Medium",
    estimatedTime: "1 min",
    generationTime: "0.38s",
    useCase: "Private communities, Access control",
    hackathonTrack: "Private Launchpads",
  },
  {
    id: "range-proof",
    name: "Range Proof",
    description: "Prove value is within range without exact number",
    icon: "range",
    category: "Data",
    usageCount: 567,
    difficulty: "Medium",
    estimatedTime: "1 min",
    generationTime: "0.42s",
    useCase: "Credit scores, Salary verification",
    hackathonTrack: "Open Track",
  },
  {
    id: "private-voting",
    name: "Private Voting",
    description: "Vote anonymously with cryptographic proof",
    icon: "voting",
    category: "Governance",
    usageCount: 432,
    difficulty: "Advanced",
    estimatedTime: "2 min",
    generationTime: "0.40s",
    useCase: "DAO voting, Elections",
    hackathonTrack: "Open Track",
  },
  {
    id: "credential-proof",
    name: "Credential Verification",
    description: "Prove valid credentials without revealing data",
    icon: "credential",
    category: "Identity",
    usageCount: 289,
    difficulty: "Medium",
    estimatedTime: "1 min",
    generationTime: "0.52s",
    isPopular: true,
    useCase: "KYC, License verification",
    hackathonTrack: "Private Launchpads",
  },
  {
    id: "token-swap",
    name: "Token Swap Proof",
    description: "Prove sufficient balance for swap anonymously",
    icon: "swap",
    category: "Financial",
    usageCount: 356,
    difficulty: "Medium",
    estimatedTime: "1.5 min",
    generationTime: "0.58s",
    useCase: "DEX trading, P2P swaps",
    hackathonTrack: "Private Payments",
  },
  {
    id: "signature-verification",
    name: "Signature Verification",
    description: "Verify signatures without revealing private key",
    icon: "signature",
    category: "Cryptography",
    usageCount: 198,
    difficulty: "Advanced",
    estimatedTime: "2 min",
    generationTime: "0.61s",
    useCase: "Message signing, Authentication",
    hackathonTrack: "Open Track",
  },
  {
    id: "patience-proof",
    name: "Patience Privacy Proof",
    description: "Prove you waited a time period without revealing exact timing",
    icon: "patience",
    category: "Cryptography",
    usageCount: 412,
    difficulty: "Medium",
    estimatedTime: "1 min",
    generationTime: "0.48s",
    isPopular: true,
    useCase: "Time-locked rewards, Contest verification",
    hackathonTrack: "Open Track",
  },
  {
    id: "hash-preimage",
    name: "Hash Preimage Proof",
    description: "Prove you know secret X where hash(X) = Y without revealing X",
    icon: "hash",
    category: "Cryptography",
    usageCount: 567,
    difficulty: "Easy",
    estimatedTime: "30 sec",
    generationTime: "0.35s",
    useCase: "Commitments, Secret reveals, Voting",
    hackathonTrack: "Private Payments",
  },
  {
    id: "quadratic-voting",
    name: "Quadratic Voting",
    description: "Fair governance voting with quadratic token weighting - prevents whale dominance",
    icon: "vote",
    category: "Governance",
    usageCount: 892,
    difficulty: "Medium",
    estimatedTime: "45 sec",
    generationTime: "0.51s",
    useCase: "DAO governance, Fair voting, Token voting",
    hackathonTrack: "Open Track",
  },
  {
    id: "nft-ownership",
    name: "NFT Ownership Proof",
    description: "Prove you own an NFT from a collection without revealing which specific NFT",
    icon: "nft",
    category: "NFT",
    usageCount: 1234,
    difficulty: "Medium",
    estimatedTime: "50 sec",
    generationTime: "0.60s",
    useCase: "Exclusive access, Airdrops, Community membership",
    hackathonTrack: "Private Launchpads",
  },
  {
    id: "anonymous-reputation",
    name: "Anonymous Reputation",
    description: "Prove your reputation score exceeds threshold without revealing identity",
    icon: "star",
    category: "Social",
    usageCount: 745,
    difficulty: "Medium",
    estimatedTime: "55 sec",
    generationTime: "0.76s",
    useCase: "Credit systems, Access control, Anonymous verification",
    hackathonTrack: "Open Track",
  },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "age": return AgeVerificationIcon;
    case "balance": return BalanceIcon;
    case "membership": return MembershipIcon;
    case "range": return RangeIcon;
    case "voting": return VotingIcon;
    case "vote": return VotingIcon;
    case "nft": return MembershipIcon;
    case "star": return RangeIcon;
    case "credential": return MembershipIcon; // Reuse similar icon
    case "swap": return BalanceIcon; // Reuse similar icon
    case "signature": return VotingIcon; // Reuse similar icon
    case "patience": return RangeIcon; // Time-based, similar to range
    case "hash": return VotingIcon; // Cryptographic, similar to voting
    default: return AgeVerificationIcon;
  }
};

export default function TemplateGallery({ highlightTemplateId }: TemplateGalleryProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Identity", "Financial", "Access", "Data", "Governance", "Cryptography"];

  // Scroll to highlighted template when component mounts
  useEffect(() => {
    if (highlightTemplateId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`template-${highlightTemplateId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightTemplateId]);

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
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/50 rounded-full">
            <span className="text-lg">🏆</span>
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
              Solana Privacy Hack 2026
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-primary/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-medium text-zk-primary uppercase tracking-wider">
              Real Groth16 Proofs
            </span>
          </div>
        </div>

        <h2 className="font-hatton text-5xl text-white mb-4">
          Privacy Tooling <span className="text-purple-400">Templates</span>
        </h2>
        <p className="text-xl text-zk-gray max-w-2xl">
          Build private payments, privacy-preserving credentials, and anonymous voting.
          Real ZK proofs generated in your browser - no server required.
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zk-gray hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
        {filteredTemplates.map((template, index) => {
          const isHighlighted = highlightTemplateId === template.id;
          return (
          <div
            key={template.id}
            id={`template-${template.id}`}
            className={`group relative bg-gradient-to-br from-zk-dark/50 to-zk-darker/50 border rounded-2xl p-6 hover:border-zk-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden ${
              isHighlighted 
                ? 'border-zk-primary/70 animate-pulse shadow-2xl shadow-zk-primary/50 ring-4 ring-zk-primary/30' 
                : 'border-zk-gray/20'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-zk-primary/5 to-zk-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hackathon Track Badge - Top Center */}
            {template.hackathonTrack && (
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full flex items-center gap-1 ${
                template.hackathonTrack === "Private Payments" 
                  ? "bg-purple-500/20 border border-purple-500/40" 
                  : template.hackathonTrack === "Private Launchpads"
                  ? "bg-zk-primary/20 border border-zk-primary/40"
                  : "bg-amber-500/20 border border-amber-500/40"
              }`}>
                <span className="text-xs">🏆</span>
                <span className={`text-xs font-medium ${
                  template.hackathonTrack === "Private Payments" 
                    ? "text-purple-400" 
                    : template.hackathonTrack === "Private Launchpads"
                    ? "text-zk-primary"
                    : "text-amber-400"
                }`}>{template.hackathonTrack}</span>
              </div>
            )}

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
              <p className="text-zk-gray text-sm mb-3 leading-relaxed">
                {template.description}
              </p>
              
              {/* Use Case */}
              <p className="text-xs text-zk-gray/70 italic mb-6">
                Use case: {template.useCase}
              </p>

              {/* Enhanced Stats */}
              <div className="space-y-3 mb-6">
                {/* Usage & Generation Time */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zk-gray">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{template.usageCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} proofs generated</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zk-primary font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{template.generationTime}</span>
                  </div>
                </div>

                {/* Type & Difficulty */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zk-gray">
                    <span>Type:</span>
                    <span className="font-medium text-white">Groth16</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded font-medium ${
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
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-zk-gray">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{template.estimatedTime} to complete</span>
              </div>
            </div>

            {/* Rune Decoration */}
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">
              ᚱ
            </div>
          </div>
        );
        })}
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

