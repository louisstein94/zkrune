"use client";

import { FC, useMemo, useState } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { generateClientProof } from "@/lib/clientZkProof";

const VERIFIER_ADDRESS = (process.env.NEXT_PUBLIC_EVM_VERIFIER_ADDRESS ||
  "0xa03A353d890033aC9b3044776440C2a4c9E849EA") as `0x${string}`;

const ABI = parseAbi([
  "function verifyProofStatic(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) view returns (bool)",
]);

const baseClient = createPublicClient({ chain: base, transport: http() });

type Stage = "idle" | "proving" | "verifying" | "calling" | "done" | "error";

const PROMPTS = [
  "A neon-lit Solana validator at midnight, cinematic, photorealistic",
  "A cyberpunk fox holding a zk-SNARK rune, ultra-detailed, 8k",
  "Bitcoin Runes engraved on obsidian, volumetric lighting, art-station",
];

export const XonaDemo: FC = () => {
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState<string>(
    String(currentYear - 25)
  );
  const [prompt, setPrompt] = useState<string>(PROMPTS[0]);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string>("");
  const [proofMeta, setProofMeta] = useState<{
    timing: number;
    proofHash: string;
  } | null>(null);
  const [verified, setVerified] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>("");

  const x402Payload = useMemo(
    () => ({
      method: "POST",
      url: "https://api.xona-agent.com/v1/x402/image/generate",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": "<base64(x402-v1 USDC transfer · $0.04)>",
        "X-zkRune-Proof": proofMeta?.proofHash
          ? `0x${proofMeta.proofHash.slice(0, 16)}…${proofMeta.proofHash.slice(-8)}`
          : "0x<groth16-proof-hash>",
        "X-zkRune-Circuit": "age-verification",
        "X-zkRune-Verifier": `base:${VERIFIER_ADDRESS.slice(0, 10)}…`,
      },
      body: { prompt, model: "xona-image-v1", ratio: "1:1" },
    }),
    [proofMeta, prompt]
  );

  const reset = () => {
    setStage("idle");
    setError("");
    setProofMeta(null);
    setVerified(false);
    setGeneratedAt("");
  };

  const run = async () => {
    setError("");
    setProofMeta(null);
    setVerified(false);
    setGeneratedAt("");

    const yearNum = parseInt(birthYear, 10);
    if (
      Number.isNaN(yearNum) ||
      yearNum < 1900 ||
      yearNum > currentYear
    ) {
      setError("Enter a birth year between 1900 and the current year.");
      setStage("error");
      return;
    }
    if (currentYear - yearNum < 18) {
      setError(
        "Age circuit constraint requires age >= 18. A proof cannot be generated for an underage input — that is the point."
      );
      setStage("error");
      return;
    }

    try {
      setStage("proving");
      const result = await generateClientProof("age-verification", {
        birthYear: String(yearNum),
        currentYear: String(currentYear),
        minimumAge: "18",
      });
      if (!result.success || !result.proof) {
        throw new Error(result.error || "Proof generation failed");
      }
      setProofMeta({
        timing: result.timing || 0,
        proofHash: result.proof.proofHash,
      });

      setStage("verifying");
      const groth = result.proof.groth16Proof;
      const a: [bigint, bigint] = [
        BigInt(groth.pi_a[0]),
        BigInt(groth.pi_a[1]),
      ];
      const b: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(groth.pi_b[0][1]), BigInt(groth.pi_b[0][0])],
        [BigInt(groth.pi_b[1][1]), BigInt(groth.pi_b[1][0])],
      ];
      const c: [bigint, bigint] = [
        BigInt(groth.pi_c[0]),
        BigInt(groth.pi_c[1]),
      ];
      const pubInputs = (result.proof.publicSignals as string[]).map((s) =>
        BigInt(s)
      );

      const onchain = await baseClient.readContract({
        address: VERIFIER_ADDRESS,
        abi: ABI,
        functionName: "verifyProofStatic",
        args: [0, a, b, c, pubInputs],
      });
      if (!onchain) {
        throw new Error("Base verifier returned false.");
      }
      setVerified(true);

      setStage("calling");
      await new Promise((r) => setTimeout(r, 1400));

      setGeneratedAt(new Date().toISOString());
      setStage("done");
    } catch (e: any) {
      setError(e.shortMessage || e.message || "Unknown error");
      setStage("error");
    }
  };

  const busy =
    stage === "proving" || stage === "verifying" || stage === "calling";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-zk-dark/60 border border-zk-primary/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-hatton text-2xl text-white">Try the gate</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary">
            Live ZK · Live Base
          </span>
        </div>

        <label className="block text-xs font-medium text-zk-gray mb-2 uppercase tracking-wider">
          Your birth year (private)
        </label>
        <input
          type="number"
          value={birthYear}
          onChange={(e) => {
            setBirthYear(e.target.value);
            if (stage === "error") reset();
          }}
          min={1900}
          max={currentYear}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm mb-1"
        />
        <p className="text-xs text-zk-gray mb-5">
          Stays in the browser. Only the boolean &quot;age &ge; 18&quot; is exposed
          on-chain.
        </p>

        <label className="block text-xs font-medium text-zk-gray mb-2 uppercase tracking-wider">
          Image prompt
        </label>
        <select
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors text-sm mb-5"
        >
          {PROMPTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={run}
          disabled={busy}
          className="w-full py-3.5 bg-gradient-to-r from-zk-primary to-zk-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {stage === "proving" && (
            <>
              <Spinner /> Generating ZK proof…
            </>
          )}
          {stage === "verifying" && (
            <>
              <Spinner /> Verifying on Base mainnet…
            </>
          )}
          {stage === "calling" && (
            <>
              <Spinner /> Calling Xona x402 endpoint (simulated)…
            </>
          )}
          {(stage === "idle" || stage === "error" || stage === "done") &&
            "Prove age and generate"}
        </button>

        <ol className="mt-6 space-y-2 text-xs text-zk-gray">
          <StageLine
            label="Groth16 proof generated client-side"
            done={!!proofMeta}
            extra={
              proofMeta
                ? `${(proofMeta.timing / 1000).toFixed(2)}s · hash 0x${proofMeta.proofHash.slice(0, 10)}…`
                : undefined
            }
          />
          <StageLine
            label="On-chain verification on Base"
            done={verified}
            extra={
              verified
                ? `${VERIFIER_ADDRESS.slice(0, 6)}…${VERIFIER_ADDRESS.slice(-4)} · view call · no gas`
                : undefined
            }
          />
          <StageLine
            label="x402 image-gen call to Xona"
            done={stage === "done"}
            extra={
              stage === "done"
                ? "Simulated — partner-side call shown in payload panel"
                : undefined
            }
            simulated
          />
        </ol>
      </div>

      <div className="space-y-6">
        <div className="bg-zk-dark/60 border border-zk-gray/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-hatton text-xl text-white">x402 request</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-zk-gray/30 bg-zk-gray/10 text-zk-gray">
              Simulated
            </span>
          </div>
          <pre className="text-[11px] leading-relaxed text-zk-gray font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(x402Payload, null, 2)}
          </pre>
          <p className="mt-4 text-xs text-zk-gray/70 leading-relaxed">
            Endpoint URL is illustrative. The <code className="text-zk-primary">X-zkRune-Proof</code> header
            and verifier reference show how a partner could enforce both
            payment and eligibility at the HTTP layer.
          </p>
        </div>

        <div className="bg-zk-dark/60 border border-zk-gray/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-hatton text-xl text-white">Output preview</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-zk-gray/30 bg-zk-gray/10 text-zk-gray">
              Simulated
            </span>
          </div>
          <OutputPreview prompt={prompt} ready={stage === "done"} />
          {stage === "done" && (
            <p className="mt-3 text-xs text-zk-gray/70 leading-relaxed">
              Generated at {generatedAt}. In a live integration the binary
              would be the response body of the x402 call above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

function StageLine({
  label,
  done,
  extra,
  simulated,
}: {
  label: string;
  done: boolean;
  extra?: string;
  simulated?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
          done
            ? simulated
              ? "border-zk-gray/40 bg-zk-gray/10 text-zk-gray"
              : "border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary"
            : "border-zk-gray/20 bg-transparent text-zk-gray/40"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div className="flex-1 min-w-0">
        <p className={done ? "text-white" : "text-zk-gray/70"}>{label}</p>
        {extra && (
          <p className="text-zk-gray/60 font-mono text-[10px] mt-0.5 break-all">
            {extra}
          </p>
        )}
      </div>
    </li>
  );
}

function OutputPreview({ prompt, ready }: { prompt: string; ready: boolean }) {
  if (!ready) {
    return (
      <div className="aspect-square w-full rounded-xl border border-dashed border-zk-gray/20 bg-zk-darker/50 flex items-center justify-center">
        <p className="text-xs text-zk-gray/60">
          Output appears once the gate passes.
        </p>
      </div>
    );
  }
  const seed = prompt
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue1 = seed % 360;
  const hue2 = (seed * 7) % 360;
  return (
    <div
      className="aspect-square w-full rounded-xl flex items-center justify-center text-center p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${hue1} 70% 25%), hsl(${hue2} 70% 15%))`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">
          Xona Agent · simulated output
        </p>
        <p className="text-sm text-white/90 leading-snug max-w-xs mx-auto">
          {prompt}
        </p>
      </div>
    </div>
  );
}