"use client";

export default function ComparisonTable() {
  const comparisons = [
    {
      feature: "Privacy Level",
      traditional: "Partial (metadata visible)",
      zkRune: "Complete (zero-knowledge)",
    },
    {
      feature: "Setup Complexity",
      traditional: "High (cryptography knowledge)",
      zkRune: "None (templates ready)",
    },
    {
      feature: "Development Time",
      traditional: "Weeks/Months",
      zkRune: "Minutes",
    },
    {
      feature: "Trust Model",
      traditional: "Trust the verifier",
      zkRune: "Trustless (math-based)",
    },
    {
      feature: "Data Exposure",
      traditional: "Full data required",
      zkRune: "Zero data revealed",
    },
    {
      feature: "Blockchain Integration",
      traditional: "Manual implementation",
      zkRune: "One-click Zcash deploy",
    },
  ];

  return (
    <section className="relative py-24 px-16">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Why zkRune
            </span>
          </div>

          <h2 className="font-hatton text-5xl text-white mb-4">
            Traditional vs <span className="text-zk-primary">zkRune</span>
          </h2>
          <p className="text-xl text-zk-gray max-w-2xl mx-auto">
            See how zkRune simplifies zero-knowledge proof development
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-zk-gray/20">
              <div className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Feature
              </div>
              <div className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Traditional
              </div>
              <div className="text-sm font-medium text-zk-primary uppercase tracking-wider">
                zkRune
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-6 ${
                  index < comparisons.length - 1 ? "border-b border-zk-gray/10" : ""
                } hover:bg-zk-darker/50 transition-colors`}
              >
                <div className="font-medium text-white text-sm">{row.feature}</div>
                <div className="text-zk-gray flex items-center gap-2 text-sm">
                  <span className="text-red-400">✕</span>
                  <span className="line-clamp-2">{row.traditional}</span>
                </div>
                <div className="text-white flex items-center gap-2 text-sm">
                  <span className="text-zk-primary">✓</span>
                  <span className="line-clamp-2">{row.zkRune}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {comparisons.map((row, index) => (
              <div key={index} className="bg-zk-darker/50 rounded-xl p-4">
                <p className="text-white font-medium mb-3 text-sm">{row.feature}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="text-red-400 flex-shrink-0">✕</span>
                    <span className="text-zk-gray">{row.traditional}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zk-primary flex-shrink-0">✓</span>
                    <span className="text-white">{row.zkRune}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zk-gray">
            Built on industry-standard{" "}
            <span className="text-zk-primary font-medium">zk-SNARKs</span> and{" "}
            <span className="text-zk-primary font-medium">Zcash</span> blockchain
          </p>
        </div>
      </div>
    </section>
  );
}

