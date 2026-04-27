import type { Metadata } from "next";
import Link from "next/link";
import { getIntegration } from "@/data/integrations";
import { IntegrationHero } from "@/components/integrations/IntegrationHero";
import { ArchitectureDiagram } from "@/components/integrations/ArchitectureDiagram";
import { XonaDemo } from "@/components/integrations/xona/XonaDemo";

const integration = getIntegration("xona")!;

export const metadata: Metadata = {
  title: `zkRune × ${integration.name} — Reference integration`,
  description: integration.description,
  alternates: { canonical: "https://zkrune.com/integrations/xona" },
};

const STEPS = [
  {
    label: "User submits private input",
    detail:
      "Birth year stays in the browser. Never sent to any server, never written to logs.",
    status: "real" as const,
  },
  {
    label: "Groth16 proof generated client-side",
    detail:
      "snarkjs runs in the browser against the age-verification circuit. Output: a 200-byte SNARK plus public signals (currentYear, minimumAge).",
    status: "real" as const,
  },
  {
    label: "Verified on Base mainnet",
    detail:
      "verifyProofStatic view call against the deployed zkRune verifier. No wallet, no gas, no off-chain trust.",
    status: "real" as const,
  },
  {
    label: "x402 image-gen call to Xona",
    detail:
      "Partner endpoint receives the proof hash and verifier reference alongside the x402 payment. Simulated here for the demo.",
    status: "simulated" as const,
  },
];

const CODE_SAMPLE = `// 1. Generate the age proof in the browser (zkRune SDK)
const proof = await zkRune.generateClientProof("age-verification", {
  birthYear: "2000",
  currentYear: "${new Date().getFullYear()}",
  minimumAge: "18",
});

// 2. Verify on Base mainnet (read-only, no gas)
const ok = await baseVerifier.verifyProofStatic(
  /* templateId */ 0,
  proof.groth16Proof,
  proof.publicSignals
);

// 3. Call the x402 endpoint with payment + zkRune proof header
const res = await fetch("https://api.xona-agent.com/v1/x402/image/generate", {
  method: "POST",
  headers: {
    "X-Payment": x402Payment, // standard x402 header
    "X-zkRune-Proof": proof.proofHash,
    "X-zkRune-Circuit": "age-verification",
    "X-zkRune-Verifier": "base:0xa03A353d…9E849EA",
  },
  body: JSON.stringify({ prompt, model: "xona-image-v1" }),
});`;

export default function XonaIntegrationPage() {
  return (
    <>
      <IntegrationHero integration={integration} />

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3">
            What this demo shows
          </h2>
          <p className="text-sm md:text-base text-zk-gray mb-8 max-w-3xl leading-relaxed">
            Three steps. Two are real, one is simulated — by design. The goal
            is not to ship a paid Xona call from this page. The goal is to
            prove that zkRune drops in front of any x402 endpoint without
            new infrastructure on either side.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <DemoStep
              status="real"
              n="1"
              title="Real ZK proof, in your browser"
              body="snarkjs runs the production age-verification circuit on your input. ~0.5s. Your birth year never leaves the page — only the boolean 'age ≥ 18' is exposed."
            />
            <DemoStep
              status="real"
              n="2"
              title="Real on-chain verification on Base"
              body="The proof is checked against the deployed zkRune verifier on Base mainnet via verifyProofStatic. View call — no wallet, no gas. Anyone can replay it."
            />
            <DemoStep
              status="simulated"
              n="3"
              title="Simulated x402 call to Xona"
              body="The right-hand panel shows the exact HTTP request a live Xona integration would receive: x402 payment header alongside an X-zkRune-Proof reference. The image is a placeholder."
            />
          </div>

          <XonaDemo />
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Why a ZK gate?
          </h2>
          <p className="text-sm md:text-base text-zk-gray mb-8 max-w-3xl leading-relaxed">
            x402 makes payment permissionless. Eligibility — age, jurisdiction,
            license, brand-safety tier — is a separate question, and it has not
            been answered well in the agent economy. The options today all
            either leak data or break the agent flow.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-6 bg-zk-dark/40 border border-zk-gray/20 rounded-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zk-gray/70 mb-4">
                Without zkRune
              </p>
              <ul className="space-y-3 text-sm text-zk-gray leading-relaxed">
                <Bullet
                  title="Trust the caller's word"
                  body="Operator carries legal liability for any false claim. Not a real option for regulated content."
                />
                <Bullet
                  title="Demand ID upload"
                  body="Kills agent UX. Storing PII opens a separate compliance burden — data-minimization issues, breach exposure."
                />
                <Bullet
                  title="Plug in a hosted KYC vendor"
                  body="Per-check cost, redirect flows that break agent loops, mostly built for human verification — not headless agents."
                />
                <Bullet
                  title="Token-only gating"
                  body="Proves the wallet paid. Proves nothing about who is calling, where, or under what license."
                />
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-zk-primary/15 to-zk-accent/10 border border-zk-primary/30 rounded-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zk-primary mb-4">
                With zkRune
              </p>
              <ul className="space-y-3 text-sm text-white/90 leading-relaxed">
                <Bullet
                  title="200-byte proof, ~0.5s, fully client-side"
                  body="No upload, no redirect, no third-party round-trip. The math runs in the user's browser."
                />
                <Bullet
                  title="Zero raw PII transmitted"
                  body="Not to Xona, not to zkRune, not to any RPC. Only the boolean claim and a Groth16 proof."
                />
                <Bullet
                  title="Same primitive for humans and agents"
                  body="Browser SDK for users on a webpage; Node SDK or plain HTTP for headless agents calling x402 endpoints."
                />
                <Bullet
                  title="On-chain verifier, audit trail by default"
                  body="Every match leaves a cryptographic record on Base mainnet — regulator-shaped, no extra logging stack."
                />
              </ul>
            </div>
          </div>

          <p className="mt-6 text-sm text-zk-gray max-w-3xl leading-relaxed">
            Same x402 endpoint, same payment flow — just one extra header
            carrying a proof a verifier already trusts.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-hatton text-3xl text-white">Architecture</h2>
          </div>
          <ArchitectureDiagram steps={STEPS} />
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-6">
            Integration sketch
          </h2>
          <div className="bg-zk-dark/60 border border-zk-gray/15 rounded-2xl p-6 md:p-8">
            <pre className="text-xs md:text-sm leading-relaxed text-zk-gray font-mono overflow-x-auto">
              <code>{CODE_SAMPLE}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-6">
            Why it fits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Reason
              title="Same chain footprint"
              body="Xona ships on SKALE on Base. zkRune's Base verifier (0xa03A353d…) is already live on mainnet — no new infra to deploy."
            />
            <Reason
              title="Orthogonal to x402"
              body="x402 answers who paid. zkRune answers who is allowed. Together they enforce payment and eligibility at the HTTP layer, with no shared state."
            />
            <Reason
              title="Compliance-ready"
              body="Age, jurisdiction, and license proofs map directly to the regulatory pressure shaping AI generation. Zero raw PII retained."
            />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-zk-primary/15 to-zk-accent/10 border border-zk-primary/30 rounded-2xl text-center">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Build this for real
          </h2>
          <p className="text-sm text-zk-gray mb-6 max-w-xl mx-auto leading-relaxed">
            This is a community-built reference design, not an official
            partnership. If you are on the Xona team, or building an x402
            service that needs an eligibility layer, let&apos;s wire up the
            live call.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20%C3%97%20Xona%20integration"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zk-primary to-zk-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Get in touch
            </a>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zk-gray/30 text-zk-gray text-sm font-medium rounded-lg hover:text-white hover:border-zk-primary/40 transition-colors"
            >
              See all integrations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Reason({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 bg-zk-dark/40 border border-zk-gray/15 rounded-xl">
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-zk-gray leading-relaxed">{body}</p>
    </div>
  );
}

function DemoStep({
  n,
  title,
  body,
  status,
}: {
  n: string;
  title: string;
  body: string;
  status: "real" | "simulated";
}) {
  const isReal = status === "real";
  return (
    <div
      className={`p-5 rounded-2xl border ${
        isReal
          ? "bg-zk-dark/60 border-zk-primary/30"
          : "bg-zk-dark/40 border-zk-gray/20"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-zk-gray">{n.padStart(2, "0")}</span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isReal
              ? "border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary"
              : "border-zk-gray/30 bg-zk-gray/10 text-zk-gray"
          }`}
        >
          {isReal ? "Live" : "Simulated"}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-xs text-zk-gray leading-relaxed">{body}</p>
    </div>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50" />
      <div className="flex-1">
        <span className="font-semibold">{title}.</span> {body}
      </div>
    </li>
  );
}