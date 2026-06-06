// Benchmark: client-side Groth16 proof generation across all production
// circuits with fixtures.
//
// For each circuit with a circuits/<name>/input.json fixture, runs
// snarkjs.groth16.fullProve N times against the WASM + zkey artefacts
// in public/circuits/, captures wall-clock proof generation time,
// JSON proof payload size, and compressed/base64-encoded sizes.
//
// Output:
//   - business/whitepaper/bench-<ISO-date>.json — raw observations
//   - business/whitepaper/bench-<ISO-date>.md   — markdown summary
//
// Run from repo root:
//   node scripts/bench-proofs.mjs
//
// Configure runs per circuit via N env var (default 20):
//   N=50 node scripts/bench-proofs.mjs
//
// Notes
// - "Compressed" here is the gzipped JSON payload, which is what an
//   HTTP transport with `accept-encoding: gzip` would deliver.
//   It is NOT Groth16 G1/G2 point compression. The wire size and the
//   on-chain calldata size are different metrics; this script measures
//   the wire size that integrators actually pay for.
// - "Base64-encoded gzipped" approximates the QR/NFC payload size for
//   embedded-delivery integrations (e.g. wallet → relying-party scan).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { groth16 } from "snarkjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..");

const CIRCUITS = [
  "age-verification",
  "balance-proof",
  "range-proof",
  "membership-proof",
  "hash-preimage",
  "private-voting",
  "quadratic-voting",
  "signature-verification",
  "anonymous-reputation",
  "credential-proof",
  "nft-ownership",
  "token-swap",
  "patience-proof",
];

const N = parseInt(process.env.N || "20", 10);

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(
    sortedArr.length - 1,
    Math.floor((p / 100) * sortedArr.length),
  );
  return sortedArr[idx];
}

function summarise(label, samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    label,
    n: sorted.length,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    p95: percentile(sorted, 95),
    max: sorted[sorted.length - 1],
  };
}

async function benchOne(circuit) {
  const inputPath = resolve(REPO, `circuits/${circuit}/input.json`);
  const wasmPath = resolve(REPO, `public/circuits/${circuit}.wasm`);
  const zkeyPath = resolve(REPO, `public/circuits/${circuit}.zkey`);

  if (!existsSync(inputPath) || !existsSync(wasmPath) || !existsSync(zkeyPath)) {
    return {
      circuit,
      skipped: true,
      reason: `missing ${!existsSync(inputPath) ? "input" : !existsSync(wasmPath) ? "wasm" : "zkey"}`,
    };
  }

  const input = JSON.parse(readFileSync(inputPath, "utf-8"));

  const timesMs = [];
  const jsonSizes = [];
  const gzipSizes = [];
  const base64GzipSizes = [];
  let lastProof = null;
  let lastPublicSignals = null;

  // Warm-up — first run loads WASM and is much slower than steady state.
  // It still goes into the results so the cold-start cost is observable.
  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath,
    );
    const t1 = performance.now();
    timesMs.push(t1 - t0);

    const payload = JSON.stringify({ proof, publicSignals });
    const payloadBytes = Buffer.from(payload, "utf-8");
    jsonSizes.push(payloadBytes.length);

    const gz = gzipSync(payloadBytes);
    gzipSizes.push(gz.length);
    base64GzipSizes.push(Buffer.from(gz).toString("base64").length);

    lastProof = proof;
    lastPublicSignals = publicSignals;
  }

  return {
    circuit,
    skipped: false,
    runs: N,
    proofGenMs: summarise("proof_gen_ms", timesMs),
    jsonPayloadBytes: summarise("json_payload_bytes", jsonSizes),
    gzipPayloadBytes: summarise("gzip_payload_bytes", gzipSizes),
    base64GzippedBytes: summarise("base64_gzipped_bytes", base64GzipSizes),
    sampleProofStructure: {
      pi_a_len: lastProof.pi_a.length,
      pi_b_dims: [lastProof.pi_b.length, lastProof.pi_b[0]?.length || 0],
      pi_c_len: lastProof.pi_c.length,
      protocol: lastProof.protocol,
      curve: lastProof.curve,
      publicSignalsCount: lastPublicSignals.length,
    },
  };
}

function fmt(n) {
  return typeof n === "number" ? n.toFixed(1) : String(n);
}

function fmtInt(n) {
  return typeof n === "number" ? Math.round(n).toString() : String(n);
}

function markdownTable(results) {
  const ran = results.filter((r) => !r.skipped);
  if (ran.length === 0) return "(no circuits ran)";

  const lines = [];
  lines.push("| Circuit | Runs | Median (ms) | p95 (ms) | JSON (B) | gzip (B) | base64 gzip (B) |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const r of ran) {
    lines.push(
      `| ${r.circuit} | ${r.runs} | ${fmt(r.proofGenMs.median)} | ${fmt(r.proofGenMs.p95)} | ${fmtInt(r.jsonPayloadBytes.median)} | ${fmtInt(r.gzipPayloadBytes.median)} | ${fmtInt(r.base64GzippedBytes.median)} |`,
    );
  }

  const skipped = results.filter((r) => r.skipped);
  if (skipped.length > 0) {
    lines.push("");
    lines.push("Skipped:");
    for (const s of skipped) {
      lines.push(`- \`${s.circuit}\` — ${s.reason}`);
    }
  }

  return lines.join("\n");
}

const startedAt = new Date().toISOString();
const startWall = performance.now();
console.log(`▶ benchmark started ${startedAt}`);
console.log(`▶ N=${N} runs per circuit, ${CIRCUITS.length} circuits queued`);

const results = [];
for (const c of CIRCUITS) {
  process.stdout.write(`  · ${c.padEnd(28)}`);
  const r = await benchOne(c);
  if (r.skipped) {
    console.log(`SKIP (${r.reason})`);
  } else {
    console.log(
      `median ${fmt(r.proofGenMs.median)} ms · p95 ${fmt(r.proofGenMs.p95)} ms · JSON ${fmtInt(r.jsonPayloadBytes.median)} B`,
    );
  }
  results.push(r);
}

const finishedAt = new Date().toISOString();
const totalSec = (performance.now() - startWall) / 1000;

const env = {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  cpuCount: (await import("node:os")).cpus().length,
  cpuModel: (await import("node:os")).cpus()[0]?.model || "unknown",
};

const out = {
  startedAt,
  finishedAt,
  totalSec,
  runsPerCircuit: N,
  env,
  results,
};

const today = startedAt.slice(0, 10);
const jsonPath = resolve(REPO, `business/whitepaper/bench-${today}.json`);
const mdPath = resolve(REPO, `business/whitepaper/bench-${today}.md`);

writeFileSync(jsonPath, JSON.stringify(out, null, 2));

const md = [
  `# zkRune circuit proof-generation benchmark — ${today}`,
  "",
  `Source: \`scripts/bench-proofs.mjs\` · N=${N} runs per circuit · total ${totalSec.toFixed(1)} s`,
  "",
  `Environment: Node ${env.node} · ${env.platform}/${env.arch} · ${env.cpuModel} (${env.cpuCount} cores)`,
  "",
  "## Per-circuit (client-side, includes WASM load + witness + proof gen)",
  "",
  markdownTable(results),
  "",
  "## Notes",
  "",
  "- `Runs` includes the cold first run that pays the WASM-load tax; median and p95 reflect the steady-state cost an integrator sees in a long-lived browser tab.",
  "- `JSON` is the verbatim `JSON.stringify({ proof, publicSignals })` byte size.",
  "- `gzip` is the gzipped payload size, what HTTP transports with `accept-encoding: gzip` deliver.",
  "- `base64 gzip` approximates the QR / NFC envelope an embedded-delivery integration would carry.",
  "- These are CLIENT-side measurements. On-chain verifier gas and hosted-verifier latency are out of scope; see the whitepaper Production Posture section.",
].join("\n");

writeFileSync(mdPath, md);

console.log(`\n✓ JSON results: ${jsonPath}`);
console.log(`✓ Markdown summary: ${mdPath}`);
console.log(`✓ Done in ${totalSec.toFixed(1)} s`);
