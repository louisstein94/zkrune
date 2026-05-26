"use client";

import { useState } from "react";

type Stage = "idle" | "proving" | "verifying" | "success" | "error";

export default function HeroLiveDemo() {
  const [birthYear, setBirthYear] = useState("1995");
  const [minimumAge, setMinimumAge] = useState("18");
  const [stage, setStage] = useState<Stage>("idle");
  const [proofHash, setProofHash] = useState<string | null>(null);
  const [timing, setTiming] = useState<{ generation: number; verification: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  async function run() {
    setStage("proving");
    setErrorMsg(null);
    setProofHash(null);
    setTiming(null);

    try {
      const snarkjs = (await import("snarkjs")) as typeof import("snarkjs");

      const inputs = {
        birthYear: birthYear.trim(),
        currentYear: String(currentYear),
        minimumAge: minimumAge.trim(),
      };

      const t0 = performance.now();
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        "/circuits/age-verification.wasm",
        "/circuits/age-verification.zkey",
      );
      const t1 = performance.now();

      setStage("verifying");

      const res = await fetch("/api/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circuitName: "age-verification",
          proof,
          publicSignals,
        }),
      });
      const t2 = performance.now();

      const data = await res.json();
      if (!res.ok || !data.isValid) {
        throw new Error(data.message || data.error || "Verification failed");
      }

      const encoded = new TextEncoder().encode(JSON.stringify(proof));
      const buf = encoded.buffer.slice(
        encoded.byteOffset,
        encoded.byteOffset + encoded.byteLength,
      ) as ArrayBuffer;
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 16);

      setProofHash(hashHex);
      setTiming({ generation: Math.round(t1 - t0), verification: Math.round(t2 - t1) });
      setStage("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setStage("error");
    }
  }

  function reset() {
    setStage("idle");
    setErrorMsg(null);
    setProofHash(null);
    setTiming(null);
  }

  const proving = stage === "proving" || stage === "verifying";
  const done = stage === "success";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-zk-primary/25 bg-zk-dark/70 backdrop-blur-xl shadow-2xl shadow-zk-primary/10 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zk-darker/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              Live demo · Age verification
            </span>
          </div>
          <span className="text-[10px] font-mono text-zk-gray/60">Groth16 · BN128</span>
        </div>

        {!done && (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-zk-gray uppercase tracking-wider block mb-1.5">
                Birth year (private)
              </label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                disabled={proving}
                min="1900"
                max={currentYear}
                className="w-full px-3 py-2.5 bg-zk-darker border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-zk-primary/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zk-gray uppercase tracking-wider block mb-1.5">
                Minimum age (public)
              </label>
              <input
                type="number"
                value={minimumAge}
                onChange={(e) => setMinimumAge(e.target.value)}
                disabled={proving}
                min="1"
                max="120"
                className="w-full px-3 py-2.5 bg-zk-darker border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-zk-primary/50 disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={run}
              disabled={proving}
              className="w-full px-4 py-3 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {proving ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                    />
                  </svg>
                  {stage === "proving" ? "Generating proof…" : "Verifying…"}
                </>
              ) : (
                <>
                  Generate &amp; verify proof
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {stage === "error" && errorMsg && (
              <p className="text-xs text-red-400 leading-relaxed">{errorMsg}</p>
            )}

            <p className="text-[11px] text-zk-gray/70 leading-relaxed">
              Your birth year stays in this browser. Only{" "}
              <code className="px-1 py-0.5 bg-zk-darker rounded text-zk-primary font-mono">
                age &gt;= {minimumAge || "?"}
              </code>{" "}
              is sent to the verifier.
            </p>
          </div>
        )}

        {done && (
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-zk-secondary/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-zk-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Verified on the server</p>
                <p className="text-xs text-zk-gray">
                  Proof shows{" "}
                  <code className="px-1 py-0.5 bg-zk-darker rounded text-zk-primary font-mono text-[11px]">
                    age &gt;= {minimumAge}
                  </code>{" "}
                  without revealing the birth year.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-zk-darker/60 rounded-lg p-2.5">
                <p className="text-zk-gray uppercase tracking-wider text-[9px] mb-0.5">Proof gen</p>
                <p className="font-mono text-white">{timing?.generation}ms</p>
              </div>
              <div className="bg-zk-darker/60 rounded-lg p-2.5">
                <p className="text-zk-gray uppercase tracking-wider text-[9px] mb-0.5">Verify</p>
                <p className="font-mono text-white">{timing?.verification}ms</p>
              </div>
            </div>

            <div className="bg-zk-darker/60 rounded-lg p-2.5">
              <p className="text-zk-gray uppercase tracking-wider text-[9px] mb-1">Proof hash</p>
              <p className="font-mono text-[11px] text-zk-primary break-all">{proofHash}…</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 px-3 py-2 bg-zk-darker border border-white/10 text-white text-xs font-medium rounded-lg hover:border-zk-primary/40 transition-colors"
              >
                Try another
              </button>
              <a
                href="/docs"
                className="flex-1 px-3 py-2 bg-zk-primary/90 text-white text-xs font-medium rounded-lg hover:bg-zk-primary transition-colors text-center"
              >
                Integrate this →
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-zk-gray/70 mt-3">
        Real Groth16 proof, generated in your browser. Verified by{" "}
        <code className="font-mono text-zk-primary">/api/verify-proof</code>.
      </p>
    </div>
  );
}
