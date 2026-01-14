"use client";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "zkRune made privacy accessible. We integrated ZK proofs into our app in minutes, not months.",
      author: "Alex Chen",
      role: "CTO, PrivacyFirst",
      avatar: "AC",
    },
    {
      quote: "Finally, a tool that makes zero-knowledge proofs approachable. The templates saved us weeks of development.",
      author: "Sarah Martinez",
      role: "Blockchain Developer",
      avatar: "SM",
    },
    {
      quote: "The visual interface is game-changing. Our non-technical team can now understand and use ZK proofs.",
      author: "Michael Wong",
      role: "Product Manager, Web3 Startup",
      avatar: "MW",
    },
  ];

  const useCases = [
    {
      title: "DeFi Protocols",
      description: "Private loan applications without revealing financial details",
      icon: "DF",
      metric: "95% faster integration",
    },
    {
      title: "DAO Governance",
      description: "Anonymous voting with cryptographic verification",
      icon: "DAO",
      metric: "100% privacy guaranteed",
    },
    {
      title: "Identity Verification",
      description: "Age verification without exposing personal data",
      icon: "ID",
      metric: "GDPR compliant",
    },
  ];

  return (
    <section className="relative py-24 px-16 bg-zk-dark/20">
      <div className="max-w-7xl mx-auto">
        {/* Use Cases */}
        <div className="mb-24">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
              <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Real-World Impact
              </span>
            </div>

            <h2 className="font-hatton text-5xl text-white mb-4">
              Used by <span className="text-zk-primary">Innovators</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-zk-darker/50 border border-zk-gray/20 rounded-2xl p-8 hover:border-zk-primary/30 transition-all"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="font-hatton text-2xl text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-zk-gray mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                <div className="inline-block px-3 py-1 bg-zk-primary/10 border border-zk-primary/30 rounded-full">
                  <span className="text-sm text-zk-primary font-medium">
                    {useCase.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="mb-12 text-center">
            <h3 className="font-hatton text-4xl text-white mb-4">
              What Developers Say
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-zk-darker/50 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-secondary/30 transition-all"
              >
                <div className="mb-4">
                  <div className="flex gap-1 text-zk-primary text-xl mb-3 font-bold">
                    5/5
                  </div>
                  <p className="text-white leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zk-gray/20">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-zk-gray">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

