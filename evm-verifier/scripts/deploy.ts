import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CIRCUITS_DIR = path.join(__dirname, "../../public/circuits");

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
  return ic.map((point: string[]) => [point[0], point[1]]).flat();
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log("\nGroth16Verifier deployed to:", address);

  // Register all circuits
  for (const circuit of CIRCUITS) {
    const vk = loadVKey(circuit.name);

    const tx = await verifier.registerCircuit(
      circuit.id,
      circuit.name,
      vk.vk_alpha_1[0],
      vk.vk_alpha_1[1],
      [vk.vk_beta_2[0][1], vk.vk_beta_2[0][0]],   // snarkjs: [c1, c0] → solidity: [c0, c1]
      [vk.vk_beta_2[1][1], vk.vk_beta_2[1][0]],
      [vk.vk_gamma_2[0][1], vk.vk_gamma_2[0][0]],
      [vk.vk_gamma_2[1][1], vk.vk_gamma_2[1][0]],
      [vk.vk_delta_2[0][1], vk.vk_delta_2[0][0]],
      [vk.vk_delta_2[1][1], vk.vk_delta_2[1][0]],
      flattenIC(vk.IC),
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
