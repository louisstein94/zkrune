import type { Metadata } from "next";
import Link from "next/link";
import { getIntegration } from "@/lib/integrations";
import { IntegrationHero } from "@/components/integrations/IntegrationHero";
import { ArchitectureDiagram } from "@/components/integrations/ArchitectureDiagram";
import { XonaDemo } from "@/components/integrations/xona/XonaDemo";

const integration = getIntegration("xona")!;

export const metadata: Metadata = {
  title: `zkRune × ${integration.name} — Live on x402`,
  description: integration.description,
  alternates: { canonical: "https://zkrune.com/integrations/xona" },
};

const LIVE_ENDPOINT = "https://api.xona-agent.com/zkrune/image/flux-2-flex";

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
      "Live at api.xona-agent.com/zkrune/image/flux-2-flex. The endpoint runs the same gate behind every real request.",
    status: "real" as const,
  },
];

const CODE_SAMPLE = `// Xona's x402 image endpoint — add the zkRune gate in three lines.
// @louisstein/x402-verify · reads headers only, never the request body.
import { Hono } from "hono";
import { zkRuneHonoMiddleware } from "@louisstein/x402-verify";

app.post(
  "/image/flux-2-flex",

  // zkRune eligibility gate — rejects callers who have not proven 18+.
  // A missing or invalid proof gets a 403 challenge that mirrors x402's 402.
  zkRuneHonoMiddleware({
    requiredCircuit: "age-verification",
    validatePublicSignals: (s) => {
      const [isValid, year, minAge] = s.map(Number);
      return isValid === 1 &&
             year >= new Date().getUTCFullYear() - 1 &&
             minAge >= 18;
    },
  }),

  x402(),        // existing payment middleware — unchanged
  fluxHandler,   // existing handler — unchanged
);`;

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
            Three real steps, end to end. The gate is deployed on Xona&apos;s
            live x402 endpoint — every real request to{" "}
            <code className="text-zk-secondary">api.xona-agent.com/zkrune/image/flux-2-flex</code>{" "}
            runs through the on-chain verifier before the image is served.
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
              status="real"
              n="3"
              title="Live on Xona's x402 endpoint"
              body="The same gate runs in production at api.xona-agent.com/zkrune/image/flux-2-flex. Missing proof → 403 challenge. Valid proof → handed off to x402 for payment. Try the curl evidence below."
            />
          </div>

          <XonaDemo />
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <h2 className="font-hatton text-3xl text-white">
              Live on Xona today
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-zk-secondary/50 bg-zk-secondary/15 text-zk-secondary">
              Production
            </span>
          </div>
          <p className="text-sm md:text-base text-zk-gray mb-6 max-w-3xl leading-relaxed">
            The gate is deployed on Xona&apos;s x402 endpoint. Every real
            request to{" "}
            <a
              href={LIVE_ENDPOINT}
              target="_blank"
              rel="noreferrer"
              className="text-zk-secondary font-mono break-all hover:underline"
            >
              {LIVE_ENDPOINT.replace("https://", "")}
            </a>{" "}
            runs through{" "}
            <code className="text-zk-primary">@zkrune/x402-verify</code> before
            the image is served. Three cases, copy-pasteable.
          </p>

          <div className="space-y-3">
            <CurlCase
              label="No proof"
              status={403}
              statusKind="reject"
              cmd={`curl -X POST ${LIVE_ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"x"}'`}
              response={`{
  "error": "zkrune_eligibility_required",
  "reason": "missing_headers",
  "circuit": "age-verification",
  "verifier": "base:0xa03A353d…9E849EA",
  "generateProofAt": "https://zkrune.com",
  "message": "This endpoint requires a zkRune age-verification proof..."
}`}
              note="Gate emits the 403 challenge — same shape as x402's 402, self-describing so the caller knows exactly which proof to generate."
            />
            <CurlCase
              label="Valid proof"
              status={402}
              statusKind="pass"
              cmd={`curl -X POST ${LIVE_ENDPOINT} \\
  -H "X-zkRune-Proof: <base64 envelope>" \\
  -H "X-zkRune-Circuit: age-verification" \\
  -d '{"prompt":"a cyberpunk fox holding a zk rune"}'`}
              response={`{
  "x402Version": 2,
  "error": "Payment Required",
  "resource": {
    "url": "https://api.xona-agent.com/zkrune/image/flux-2-flex",
    "description": "...ZK age-verified, Base Mainnet."
  },
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:8453",
    "amount": "60000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }]
}`}
              note="Proof passed on-chain verification — control handed to x402, which now asks for 0.06 USDC on Base. Both gates run in production; only the success path needs a paying wallet."
            />
            <CurlCase
              label="Tampered proof"
              status={403}
              statusKind="reject"
              cmd={`curl -X POST ${LIVE_ENDPOINT} \\
  -H "X-zkRune-Proof: not-a-real-proof" \\
  -H "X-zkRune-Circuit: age-verification" \\
  -d '{"prompt":"x"}'`}
              response={`{
  "error": "zkrune_eligibility_required",
  "reason": "malformed_proof",
  "circuit": "age-verification",
  "message": "The X-zkRune-Proof header is not a valid base64-encoded proof envelope."
}`}
              note="Garbage rejected at the gate — never reaches the verifier or the payment layer."
            />
          </div>
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
          <h2 className="font-hatton text-3xl text-white mb-3">
            Endpoint integration
          </h2>
          <p className="text-sm md:text-base text-zk-gray mb-6 max-w-3xl leading-relaxed">
            The gate ships as a published npm package —{" "}
            <a
              href="https://www.npmjs.com/package/@louisstein/x402-verify"
              target="_blank"
              rel="noreferrer"
              className="text-zk-primary hover:underline"
            >
              <code>@louisstein/x402-verify</code>
            </a>
            . It reads HTTP headers only, never the request body, so it drops
            in front of any x402 endpoint regardless of stack. Xona&apos;s
            handler added three lines; the payment middleware and the handler
            stayed unchanged. Same code is now running in their production
            endpoint.
          </p>
          <div className="bg-zk-dark/60 border border-zk-gray/15 rounded-2xl p-6 md:p-8">
            <pre className="text-xs md:text-sm leading-relaxed text-zk-gray font-mono overflow-x-auto">
              <code>{CODE_SAMPLE}</code>
            </pre>
          </div>
          <div className="mt-4 flex items-start gap-2.5 p-4 bg-zk-secondary/10 border border-zk-secondary/30 rounded-xl">
            <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <p className="text-xs text-zk-gray leading-relaxed">
              <span className="text-white font-semibold">Deployed.</span>{" "}
              Live on Xona&apos;s production endpoint —{" "}
              <code className="text-zk-secondary">{LIVE_ENDPOINT.replace("https://", "")}</code>
              . The package is on npm with a comprehensive smoke test (13/13
              checks against the live Base verifier) — both sides shipped.
            </p>
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
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-zk-secondary/15 to-zk-primary/10 border border-zk-secondary/30 rounded-2xl text-center">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Already live — call it now
          </h2>
          <p className="text-sm text-zk-gray mb-6 max-w-xl mx-auto leading-relaxed">
            The integration is deployed on both sides: gate on Xona&apos;s
            production endpoint, package on npm. If you run an x402 service
            and want the same drop-in eligibility layer, the codepath is now a
            reference customers can verify themselves with a single curl.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={LIVE_ENDPOINT}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zk-secondary to-zk-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Hit the live endpoint
            </a>
            <a
              href="https://www.npmjs.com/package/@louisstein/x402-verify"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zk-gray/30 text-zk-gray text-sm font-medium rounded-lg hover:text-white hover:border-zk-primary/40 transition-colors"
            >
              npm package
            </a>
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20x402%20gate%20for%20our%20endpoint"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zk-gray/30 text-zk-gray text-sm font-medium rounded-lg hover:text-white hover:border-zk-primary/40 transition-colors"
            >
              Gate our endpoint
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

function CurlCase({
  label,
  status,
  statusKind,
  cmd,
  response,
  note,
}: {
  label: string;
  status: number;
  statusKind: "pass" | "reject";
  cmd: string;
  response: string;
  note: string;
}) {
  const passColor =
    statusKind === "pass"
      ? "border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary"
      : "border-red-500/40 bg-red-500/10 text-red-300";

  return (
    <div className="bg-zk-dark/60 border border-zk-gray/15 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-zk-gray/15 bg-zk-darker/40">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-zk-gray">
          {label}
        </span>
        <span
          className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${passColor}`}
        >
          HTTP {status}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-zk-gray/10">
        <div className="bg-zk-dark/80 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zk-gray/70 mb-2">
            Request
          </p>
          <pre className="text-[11px] leading-relaxed text-zk-gray font-mono overflow-x-auto whitespace-pre">
            {cmd}
          </pre>
        </div>
        <div className="bg-zk-dark/80 p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zk-gray/70 mb-2">
            Response
          </p>
          <pre className="text-[11px] leading-relaxed text-zk-gray font-mono overflow-x-auto whitespace-pre">
            {response}
          </pre>
        </div>
      </div>
      <p className="px-5 py-3 text-xs text-zk-gray/80 leading-relaxed border-t border-zk-gray/15">
        {note}
      </p>
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