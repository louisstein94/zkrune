/**
 * Register circuits on an already-deployed Groth16Verifier.
 * Skips already-registered circuits. Waits for confirmation between each tx.
 *
 *   EVM_VERIFIER_ADDRESS=0x... npx hardhat run scripts/registerCircuits.ts --network baseSepolia
 */
import { ethers } from "hardhat";
import { CIRCUITS, flattenIC, loadVKey } from "./circuits";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const address =
    process.env.EVM_VERIFIER_ADDRESS?.trim() ||
    process.argv[process.argv.length - 1];

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error(
      "Usage: EVM_VERIFIER_ADDRESS=0x... npx hardhat run scripts/registerCircuits.ts --network baseSepolia",
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Signer:", deployer.address);
  console.log("Verifier:", address);

  const verifier = await ethers.getContractAt("Groth16Verifier", address, deployer);

  let registered = 0;
  let skipped = 0;

  for (const circuit of CIRCUITS) {
    // Skip if already registered
    try {
      const [, , exists] = await verifier.getCircuitInfo(circuit.id);
      if (exists) {
        console.log(`  Skipped: ${circuit.name} (id=${circuit.id}) — already registered`);
        skipped++;
        continue;
      }
    } catch {
      // getCircuitInfo failed — try registering anyway
    }

    const vk = loadVKey(circuit.name);

    console.log(`  Registering: ${circuit.name} (id=${circuit.id})...`);
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

    // Wait for 2 confirmations before proceeding to next
    await tx.wait(2);
    // Extra cooldown for public RPC nonce sync
    await sleep(2000);

    registered++;
    console.log(`  ✓ ${circuit.name} (tx: ${tx.hash})`);
  }

  console.log(`\nDone. Registered: ${registered}, Skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
