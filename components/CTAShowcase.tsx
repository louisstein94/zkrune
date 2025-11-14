"use client";

export default function CTAShowcase() {
  return (
    <section className="relative py-24 px-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-zk-primary/5 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-zk-secondary/10 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-zk-dark/50 to-zk-darker/50 border border-zk-primary/20 rounded-3xl p-8 md:p-12 lg:p-16 text-center backdrop-blur-sm">
          {/* Floating Runes */}
          <div className="absolute top-8 left-8 text-4xl opacity-20 animate-float">
            ᚱ
          </div>
          <div
            className="absolute bottom-8 right-8 text-4xl opacity-20 animate-float"
            style={{ animationDelay: "1s" }}
          >
            ᛉ
          </div>

          {/* Content */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-sm font-medium text-zk-primary uppercase tracking-wider">
              Open Source • Free to Use
            </span>
          </div>

          <h2 className="font-hatton text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-6">
            Ready to Create
            <br />
            <span className="text-zk-primary">ZK Proofs?</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-zk-gray max-w-2xl mx-auto mb-8 px-4">
            Join developers building the future of privacy with zkRune.
            Create your first zero-knowledge proof in under 60 seconds.
          </p>

          {/* Real Technical Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-hatton text-white">
                0.44<span className="text-zk-primary">s</span>
              </p>
              <p className="text-xs md:text-sm text-zk-gray">Proof Speed</p>
            </div>
            <div className="hidden sm:block w-px bg-zk-gray/20" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-hatton text-white">
                5<span className="text-zk-primary">/5</span>
              </p>
              <p className="text-xs md:text-sm text-zk-gray">Real Circuits</p>
            </div>
            <div className="hidden sm:block w-px bg-zk-gray/20" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-hatton text-white">
                100<span className="text-zk-primary">%</span>
              </p>
              <p className="text-xs md:text-sm text-zk-gray">Open Source</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/templates"
              className="px-10 py-4 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-2xl shadow-zk-primary/20 text-lg"
            >
              Try Templates →
            </a>
            <a
              href="/docs"
              className="px-10 py-4 border-2 border-zk-primary/30 text-zk-primary font-medium rounded-full hover:bg-zk-primary/10 transition-all text-lg"
            >
              Read Documentation
            </a>
          </div>

          <p className="mt-6 text-xs md:text-sm text-zk-gray px-4">
            No credit card required • Open source • Built for ZypherPunk Hackathon
          </p>
        </div>
      </div>
    </section>
  );
}

