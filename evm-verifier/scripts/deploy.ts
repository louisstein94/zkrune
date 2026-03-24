import { ethers } from "hardhat";
import { CIRCUITS, flattenIC, loadVKey } from "./circuits";

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(deployer.address)), "ETH");

  const Verifier = await ethers.getContractFactory("Groth16Verifier");

  // Public RPCs sometimes lag; explicit nonce avoids "nonce too low" after deploy
  const deployNonce = await provider.getTransactionCount(deployer.address, "pending");
  const verifier = await Verifier.deploy({ nonce: deployNonce });
  const deployTx = verifier.deploymentTransaction();
  if (deployTx) await deployTx.wait(2);
  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log("\nGroth16Verifier deployed to:", address);

  for (const circuit of CIRCUITS) {
    const vk = loadVKey(circuit.name);
    const nonce = await provider.getTransactionCount(deployer.address, "pending");

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
      { nonce },
    );
    await tx.wait();
    console.log(`  Registered: ${circuit.name} (id=${circuit.id}, nPublic=${vk.nPublic})`);
  }

  console.log(`\nAll ${CIRCUITS.length} circuits registered.`);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_EVM_VERIFIER_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
