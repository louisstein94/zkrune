import type { Metadata } from "next";
import Link from "next/link";
import { getIntegration } from "@/lib/integrations";
import { IntegrationHero } from "@/components/integrations/IntegrationHero";
import { ArchitectureDiagram } from "@/components/integrations/ArchitectureDiagram";

const integration = getIntegration("brave")!;

export const metadata: Metadata = {
  title: `zkRune × ${integration.name} — Reference integration`,
  description: integration.description,
  alternates: { canonical: "https://zkrune.com/integrations/brave" },
};

const ARCHITECTURE_STEPS = [
  {
    label: "Wallet UI surfaces a Prove action",
    detail:
      "Each token row in Brave Wallet exposes a Prove button. zkRune SDK consumes the wallet provider already in scope — no new key plumbing.",
    status: "simulated" as const,
  },
  {
    label: "Circuit runs locally against wallet state",
    detail:
      "Balance proof, NFT ownership, or membership proof — pick the circuit, set the threshold, snarkjs runs in the wallet process.",
    status: "simulated" as const,
  },
  {
    label: "On-chain verifier check",
    detail:
      "Solana verifier 9apA…X7ad, Base verifier 0xa03A…9E849EA, or Sui verifier 0x2783…d4c5 — same proof, picked by chain context.",
    status: "real" as const,
  },
  {
    label: "Shareable proof artifact",
    detail:
      "Proof URL plus on-chain attestation hash. Paste anywhere — websites verify against the on-chain record without contacting Brave.",
    status: "simulated" as const,
  },
];

const CODE_SAMPLE = `// Inside Brave Wallet UI — token row "Prove balance" action
import { zkRune } from "@brave/zkrune";

const proof = await zkRune.proveBalance({
  token: selectedToken.mint,    // e.g. "SPL:51mxznNW..." or "native:SOL"
  threshold: 1000,              // in token units, never the actual balance
  // wallet provider already in scope inside Brave Wallet
});

// proof.shareableUrl  → paste anywhere; the verifier is on-chain
// proof.proofHash     → 0x... collision-resistant identifier
// proof.publicSignals → [mint, threshold, attested] — never the balance`;

export default function BraveIntegrationPage() {
  return (
    <>
      <IntegrationHero integration={integration} />

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Three layers of integration
          </h2>
          <p className="text-sm md:text-base text-zk-gray mb-8 max-w-3xl leading-relaxed">
            Each layer is shippable independently. The first layer already
            works — Brave Wallet implements the Solana wallet adapter zkRune
            consumes, so the existing balance-proof primitive runs against a
            Brave Wallet without any code change on either side. The next two
            layers are the actual proposal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Layer
              n="1"
              status="live"
              label="Today"
              title="Already works through the wallet adapter"
              body="Connect Brave Wallet to zkRune's existing balance-proof template and prove an SPL token balance ≥ X without exposing the address. No Brave-side integration required — it works because Brave Wallet ships the standard adapter."
              cta={{ href: "/templates/balance-proof", label: "Try it today" }}
            />
            <Layer
              n="2"
              status="design"
              label="Tomorrow"
              title="Native Prove action inside Brave Wallet"
              body="Each token row exposes a one-click Prove button. The SDK reads the wallet provider already in scope, runs the circuit locally, and returns a shareable proof URL. Same primitive for NFT ownership and membership proofs."
            />
            <Layer
              n="3"
              status="vision"
              label="Future"
              title="Zero-Knowledge Browsing autopilot"
              body="Brave detects verification prompts on the open web — age gates, KYC checkpoints, eligibility forms. Instead of asking the user for raw data, the browser delivers a zkRune proof. Same primitive across the consumer web."
            />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Why a browser-native ZK primitive?
          </h2>
          <p className="text-sm md:text-base text-zk-gray mb-8 max-w-3xl leading-relaxed">
            The privacy story has been one-sided for fifteen years: block
            trackers, block ads, block fingerprinting. Verification prompts —
            age, balance, license, jurisdiction — still demand raw data because
            the browser has nothing better to offer. zkRune is the missing
            response.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-6 bg-zk-dark/40 border border-zk-gray/20 rounded-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zk-gray/70 mb-4">
                What the browser does today
              </p>
              <ul className="space-y-3 text-sm text-zk-gray leading-relaxed">
                <Bullet
                  title="Block, but never substitute"
                  body="Brave already blocks third-party trackers and fingerprinting. Forms still demand raw data — there is no positive primitive to hand back."
                />
                <Bullet
                  title="Wallet exposes the address by default"
                  body="A balance check leaks the entire on-chain history of the wallet. There is no native way to prove a threshold without revealing the source."
                />
                <Bullet
                  title="Extensions are the workaround"
                  body="Reclaim, zkPass, and others ship as third-party extensions. Privacy-conscious users install them; the long tail does not."
                />
                <Bullet
                  title="Age and jurisdiction prompts route to ID upload"
                  body="Centralized KYC vendors get the data. Operator gets the liability. User gets the friction."
                />
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-zk-primary/15 to-zk-accent/10 border border-zk-primary/30 rounded-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-zk-primary mb-4">
                With zkRune as a native primitive
              </p>
              <ul className="space-y-3 text-sm text-white/90 leading-relaxed">
                <Bullet
                  title="Positive answer, not just refusal"
                  body="When a site asks for a fact, the browser hands back a proof of the fact — not the underlying data, and not nothing."
                />
                <Bullet
                  title="Wallet UX without address leakage"
                  body="Prove a token balance threshold, NFT ownership, or membership without disclosing the address. The wallet stays private by default."
                />
                <Bullet
                  title="Default for everyone, not just opt-in users"
                  body="Built into the browser path means the long tail is covered — not only the 5% who installed an extension."
                />
                <Bullet
                  title="On-chain audit trail by design"
                  body="Every match leaves a cryptographic record on Solana, Sui, or Base. Operators get a regulator-shaped log without retaining PII."
                />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-6">
            Architecture — Layer 2 in detail
          </h2>
          <p className="text-sm text-zk-gray mb-8 max-w-3xl leading-relaxed">
            Layer 1 is already live. Layer 3 is the long-horizon vision. This
            diagram zooms into Layer 2 — the native Prove action inside Brave
            Wallet — because that is the concrete proposal that lands first.
          </p>
          <ArchitectureDiagram steps={ARCHITECTURE_STEPS} />
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
            Why Brave specifically
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Reason
              title="Privacy posture is genuine"
              body="Defaults already block trackers, ads, and fingerprinting. ZK proofs extend the same product DNA upward — the missing positive primitive after fifteen years of refusal."
            />
            <Reason
              title="Multi-chain wallet, multi-chain verifiers"
              body="Brave Wallet handles Solana and EVM. zkRune's on-chain verifiers live on Solana, Base, and Sui. Zero new plumbing — the wallet adapter is already shared."
            />
            <Reason
              title="Prior ZK posture, no native ZK primitive yet"
              body="Brave shipped zkSENSE for ad fraud, partnered on Sui zkLogin, and explored age verification. The interest is documented; the user-facing primitive is not yet built."
            />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-zk-primary/15 to-zk-accent/10 border border-zk-primary/30 rounded-2xl text-center">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Build this with the Brave team
          </h2>
          <p className="text-sm text-zk-gray mb-6 max-w-xl mx-auto leading-relaxed">
            This is a community-built reference design, not an official
            partnership. Layer 1 is shippable today. Layer 2 is a 6–12 week
            engineering scope on the Brave Wallet UI. If you are on the Brave
            team — or building toward a browser-native ZK primitive elsewhere —
            let&apos;s talk.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20%C3%97%20Brave%20integration"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zk-primary to-zk-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Get in touch
            </a>
            <Link
              href="/templates/balance-proof"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zk-gray/30 text-zk-gray text-sm font-medium rounded-lg hover:text-white hover:border-zk-primary/40 transition-colors"
            >
              Try Layer 1 today
            </Link>
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

function Layer({
  n,
  status,
  label,
  title,
  body,
  cta,
}: {
  n: string;
  status: "live" | "design" | "vision";
  label: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  const palette =
    status === "live"
      ? {
          border: "border-zk-secondary/40",
          bg: "bg-zk-dark/60",
          badge:
            "border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary",
          badgeText: "Live today",
        }
      : status === "design"
      ? {
          border: "border-zk-primary/30",
          bg: "bg-zk-dark/60",
          badge: "border-zk-primary/40 bg-zk-primary/10 text-zk-primary",
          badgeText: "Reference design",
        }
      : {
          border: "border-zk-gray/20",
          bg: "bg-zk-dark/40",
          badge: "border-zk-gray/30 bg-zk-gray/10 text-zk-gray",
          badgeText: "Vision",
        };

  return (
    <div className={`p-5 rounded-2xl border ${palette.border} ${palette.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-zk-gray">
          {n.padStart(2, "0")} · {label}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${palette.badge}`}
        >
          {palette.badgeText}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-xs text-zk-gray leading-relaxed mb-3">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 text-xs text-zk-primary hover:text-white transition-colors"
        >
          {cta.label}
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      )}
    </div>
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