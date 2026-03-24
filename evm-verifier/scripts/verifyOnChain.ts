/**
 * Generate a real Groth16 proof with snarkjs and verify it on-chain
 * against the deployed Base Sepolia verifier.
 *
 *   EVM_VERIFIER_ADDRESS=0x... npx hardhat run scripts/verifyOnChain.ts --network baseSepolia
 */
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { CIRCUITS_DIR } from "./circuits";

const ROOT = path.join(__dirname, "../..");

async function main() {
  const address =
    process.env.EVM_VERIFIER_ADDRESS?.trim() ||
    "0x80969B5B44e05e2c285Cb3C508a49bA3C5C8Ff8a";

  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);
  console.log("Verifier:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name, "\n");

  const verifier = await ethers.getContractAt("Groth16Verifier", address, signer);

  // 1. Check circuit is registered
  const [name, nPublic, exists] = await verifier.getCircuitInfo(0);
  console.log(`Circuit 0: name="${name}", nPublic=${nPublic}, registered=${exists}`);
  if (!exists) throw new Error("age-verification not registered on this contract");

  // 2. Generate proof with snarkjs
  const wasmPath = path.join(CIRCUITS_DIR, "age-verification.wasm");
  const zkeyPath = path.join(CIRCUITS_DIR, "age-verification.zkey");
  const vkeyPath = path.join(CIRCUITS_DIR, "age-verification_vkey.json");
  const inputPath = path.join(ROOT, "circuits/age-verification/input.json");

  const inputs = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log("\nGenerating proof...");
  console.log("  birthYear:", inputs.birthYear, "(private)");
  console.log("  currentYear:", inputs.currentYear);
  console.log("  minimumAge:", inputs.minimumAge);

  const snarkjs = await import("snarkjs");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath,
  );

  // 3. Off-chain verify first
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"));
  const offChainValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  console.log("\n  Off-chain snarkjs.verify:", offChainValid);

  // 4. Format for EVM contract
  const a: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const b: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const c: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
  const pubInputs = publicSignals.map((s: string) => BigInt(s));

  // 5. On-chain verify (view call — no gas cost)
  console.log("\n  Calling verifyProofStatic on Base Sepolia...");
  const onChainValid = await verifier.verifyProofStatic(0, a, b, c, pubInputs);
  console.log("  On-chain verifyProofStatic:", onChainValid);

  // 6. On-chain verify (tx — emits event, costs gas)
  console.log("\n  Sending verifyProof tx (emits ProofVerified event)...");
  const tx = await verifier.verifyProof(0, a, b, c, pubInputs);
  const receipt = await tx.wait(2);
  console.log("  Tx hash:", tx.hash);
  console.log("  Gas used:", receipt?.gasUsed?.toString());

  const event = receipt?.logs?.[0];
  if (event) {
    console.log("  ProofVerified event emitted ✓");
  }

  // 7. Test with invalid proof (flip a coordinate)
  console.log("\n  Testing invalid proof (tampered)...");
  const badA: [bigint, bigint] = [a[0] + 1n, a[1]];
  try {
    const badResult = await verifier.verifyProofStatic(0, badA, b, c, pubInputs);
    console.log("  Invalid proof result:", badResult);
  } catch (e: any) {
    console.log("  Invalid proof reverted:", e.message.slice(0, 80));
  }

  console.log("\n✅ Base Sepolia on-chain verification complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
