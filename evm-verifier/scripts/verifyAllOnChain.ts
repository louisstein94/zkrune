/**
 * Generate real Groth16 proofs for all circuits that have input.json
 * and verify each on-chain via the deployed Base Sepolia verifier.
 *
 *   EVM_VERIFIER_ADDRESS=0x... npx hardhat run scripts/verifyAllOnChain.ts --network baseSepolia
 */
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { CIRCUITS, CIRCUITS_DIR } from "./circuits";

const ROOT = path.join(__dirname, "../..");

async function main() {
  const address =
    process.env.EVM_VERIFIER_ADDRESS?.trim() ||
    "0x80969B5B44e05e2c285Cb3C508a49bA3C5C8Ff8a";

  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  console.log("Signer:", signer.address);
  console.log("Verifier:", address);
  console.log("Network:", network.name, `(chainId: ${network.chainId})\n`);

  const verifier = await ethers.getContractAt("Groth16Verifier", address, signer);

  const snarkjs = await import("snarkjs");

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const results: { name: string; status: string; detail?: string }[] = [];

  for (const circuit of CIRCUITS) {
    const wasmPath = path.join(CIRCUITS_DIR, `${circuit.name}.wasm`);
    const zkeyPath = path.join(CIRCUITS_DIR, `${circuit.name}.zkey`);
    const vkeyPath = path.join(CIRCUITS_DIR, `${circuit.name}_vkey.json`);
    const inputPath = path.join(ROOT, "circuits", circuit.name, "input.json");

    // Skip if no input.json
    if (!fs.existsSync(inputPath)) {
      console.log(`⏭  ${circuit.name} — no input.json, skipped`);
      results.push({ name: circuit.name, status: "SKIP", detail: "no input.json" });
      skipped++;
      continue;
    }

    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
      console.log(`⏭  ${circuit.name} — missing wasm/zkey, skipped`);
      results.push({ name: circuit.name, status: "SKIP", detail: "missing artifacts" });
      skipped++;
      continue;
    }

    try {
      // 1. Generate proof
      const inputs = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        zkeyPath,
      );

      // 2. Off-chain verify
      const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"));
      const offChain = await snarkjs.groth16.verify(vkey, publicSignals, proof);
      if (!offChain) {
        console.log(`❌ ${circuit.name} — off-chain verify failed`);
        results.push({ name: circuit.name, status: "FAIL", detail: "off-chain verify false" });
        failed++;
        continue;
      }

      // 3. Format for EVM
      const a: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const pubInputs = publicSignals.map((s: string) => BigInt(s));

      // 4. On-chain static verify (view call — no gas)
      const onChain = await verifier.verifyProofStatic(circuit.id, a, b, c, pubInputs);

      if (onChain) {
        console.log(`✅ ${circuit.name} (id=${circuit.id}) — off-chain ✓ on-chain ✓`);
        results.push({ name: circuit.name, status: "PASS" });
        passed++;
      } else {
        console.log(`❌ ${circuit.name} (id=${circuit.id}) — on-chain returned false`);
        results.push({ name: circuit.name, status: "FAIL", detail: "on-chain false" });
        failed++;
      }
    } catch (e: any) {
      const msg = e.message?.slice(0, 120) || String(e);
      console.log(`❌ ${circuit.name} (id=${circuit.id}) — ${msg}`);
      results.push({ name: circuit.name, status: "FAIL", detail: msg });
      failed++;
    }
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("RESULTS");
  console.log("═".repeat(60));
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "SKIP" ? "⏭ " : "❌";
    console.log(`  ${icon} ${r.name.padEnd(25)} ${r.status}${r.detail ? ` (${r.detail})` : ""}`);
  }
  console.log("─".repeat(60));
  console.log(`  Passed: ${passed}  |  Failed: ${failed}  |  Skipped: ${skipped}  |  Total: ${CIRCUITS.length}`);
  console.log("═".repeat(60));

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
