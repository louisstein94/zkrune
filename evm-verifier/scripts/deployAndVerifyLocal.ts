/**
 * Hardhat local network: deploy Groth16Verifier, register all circuits,
 * generate a real age-verification proof with snarkjs, verify on-chain via verifyProofStatic.
 */
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "../..");
const CIRCUITS_DIR = path.join(ROOT, "public/circuits");

const CIRCUITS: { id: number; name: string }[] = [
  { id: 0, name: "age-verification" },
  { id: 1, name: "balance-proof" },
  { id: 2, name: "membership-proof" },
  { id: 3, name: "credential-proof" },
  { id: 4, name: "private-voting" },
  { id: 5, name: "nft-ownership" },
  { id: 6, name: "range-proof" },
  { id: 7, name: "hash-preimage" },
  { id: 8, name: "quadratic-voting" },
  { id: 9, name: "anonymous-reputation" },
  { id: 10, name: "token-swap" },
  { id: 11, name: "patience-proof" },
  { id: 12, name: "signature-verification" },
  { id: 13, name: "whale-holder" },
];

function loadVKey(circuitName: string) {
  const vkPath = path.join(CIRCUITS_DIR, `${circuitName}_vkey.json`);
  return JSON.parse(fs.readFileSync(vkPath, "utf-8"));
}

function flattenIC(ic: string[][]): string[] {
  return ic.map((p: string[]) => [p[0], p[1]]).flat();
}

function formatProofForContract(proof: {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
}): {
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
} {
  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ],
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
  };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network: Hardhat (local)");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const address = await verifier.getAddress();
  console.log("Groth16Verifier deployed to:", address);

  for (const circuit of CIRCUITS) {
    const vk = loadVKey(circuit.name);
    const tx = await verifier.registerCircuit(
      circuit.id,
      circuit.name,
      vk.vk_alpha_1[0],
      vk.vk_alpha_1[1],
      [vk.vk_beta_2[0][1], vk.vk_beta_2[0][0]],
      [vk.vk_beta_2[1][1], vk.vk_beta_2[1][0]],
      [vk.vk_gamma_2[0][1], vk.vk_gamma_2[0][0]],
      [vk.vk_gamma_2[1][1], vk.vk_gamma_2[1][0]],
      [vk.vk_delta_2[0][1], vk.vk_delta_2[0][0]],
      [vk.vk_delta_2[1][1], vk.vk_delta_2[1][0]],
      flattenIC(vk.IC),
    );
    await tx.wait();
    console.log(`  Registered: ${circuit.name} (id=${circuit.id})`);
  }
  console.log(`\nAll ${CIRCUITS.length} circuits registered.\n`);

  // ── Real Groth16 proof (age-verification) ─────────────────────────────
  const wasmPath = path.join(CIRCUITS_DIR, "age-verification.wasm");
  const zkeyPath = path.join(CIRCUITS_DIR, "age-verification.zkey");
  const inputPath = path.join(ROOT, "circuits/age-verification/input.json");

  if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
    console.error("Missing wasm/zkey under public/circuits/. Run from repo root with circuits built.");
    process.exit(1);
  }

  const inputs = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log("Generating Groth16 proof with snarkjs (age-verification)...");
  console.log("  inputs:", inputs);

  const snarkjs = await import("snarkjs");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath,
  );

  const okOffChain = await snarkjs.groth16.verify(loadVKey("age-verification"), publicSignals, proof);
  console.log("  Off-chain snarkjs.verify:", okOffChain);

  const formatted = formatProofForContract(proof);
  const pubInputs = publicSignals.map((s: string) => BigInt(s));

  const valid = await verifier.verifyProofStatic.staticCall(
    0,
    [formatted.a[0], formatted.a[1]],
    [
      [formatted.b[0][0], formatted.b[0][1]],
      [formatted.b[1][0], formatted.b[1][1]],
    ],
    [formatted.c[0], formatted.c[1]],
    pubInputs,
  );

  console.log("\n  On-chain verifyProofStatic (template 0, age-verification):", valid);

  if (!valid) {
    console.error("\nFAILED: On-chain verification did not match off-chain proof.");
    process.exit(1);
  }

  console.log("\n✅ Local deploy + end-to-end Groth16 verify OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
