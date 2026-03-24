import { config as loadEnv } from "dotenv";
import * as path from "path";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Hardhat does not load .env by default — read evm-verifier/.env explicitly
loadEnv({ path: path.resolve(__dirname, ".env") });

/** Only for Sepolia / Base Sepolia deploy. Empty array = `hardhat test` works without .env */
function remoteDeployerAccounts(): string[] {
  let k = process.env.DEPLOYER_PRIVATE_KEY?.trim() ?? "";
  if (!k) return [];
  if (k.startsWith('"') && k.endsWith('"')) k = k.slice(1, -1);
  if (k.startsWith("'") && k.endsWith("'")) k = k.slice(1, -1);
  if (!k.startsWith("0x")) k = `0x${k}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(k)) {
    throw new Error(
      "evm-verifier/.env: DEPLOYER_PRIVATE_KEY must be 0x + 64 hex chars (no spaces).",
    );
  }
  if (k === "0x" + "0".repeat(64)) {
    throw new Error("DEPLOYER_PRIVATE_KEY cannot be all zeros — set your real wallet key in .env");
  }
  return [k];
}

const REMOTE_ACCOUNTS = remoteDeployerAccounts();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      evmVersion: "paris",
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: REMOTE_ACCOUNTS,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: REMOTE_ACCOUNTS,
    },
  },
};

export default config;
