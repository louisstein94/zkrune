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
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-zk-gray/20">
            <div className="text-sm font-medium text-zk-gray uppercase tracking-wider">
              Feature
            </div>
            <div className="text-sm font-medium text-zk-gray uppercase tracking-wider">
              Traditional Approach
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
              <div className="font-medium text-white">{row.feature}</div>
              <div className="text-zk-gray flex items-center gap-2">
                <span className="text-red-400">✕</span>
                {row.traditional}
              </div>
              <div className="text-white flex items-center gap-2">
                <span className="text-zk-primary">✓</span>
                {row.zkRune}
              </div>
            </div>
          ))}
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

