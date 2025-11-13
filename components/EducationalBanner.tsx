"use client";

export default function EducationalBanner() {
  const zkConcepts = [
    {
      term: "Zero-Knowledge",
      definition: "Prove something is true without revealing why it's true",
      example: "Prove you're 18+ without showing your birthday",
    },
    {
      term: "zk-SNARKs",
      definition: "Succinct Non-Interactive Arguments of Knowledge - compact proofs",
      example: "Tiny proofs that anyone can verify quickly",
    },
    {
      term: "Shielded",
      definition: "Zcash's privacy feature that encrypts transaction details",
      example: "Your proof deployment is invisible on blockchain",
    },
    {
      term: "Circom",
      definition: "Language for writing zero-knowledge circuits",
      example: "The code behind ZK proofs (we handle it for you)",
    },
  ];

  return (
    <section className="relative py-16 px-16 bg-zk-dark/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="font-hatton text-4xl text-white mb-4">
            Learn <span className="text-zk-primary">ZK Concepts</span>
          </h2>
          <p className="text-zk-gray">
            Understand the technology powering zkRune
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zkConcepts.map((concept, index) => (
            <div
              key={index}
              className="bg-zk-darker/50 border border-zk-gray/20 rounded-xl p-5 hover:border-zk-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-white group-hover:text-zk-primary transition-colors">
                  {concept.term}
                </h3>
                <span className="text-zk-primary text-xl">?</span>
              </div>
              <p className="text-sm text-zk-gray mb-3 leading-relaxed">
                {concept.definition}
              </p>
              <div className="pt-3 border-t border-zk-gray/10">
                <p className="text-xs text-zk-gray italic">
                  e.g., {concept.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

