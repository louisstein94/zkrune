import * as anchor from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  getAccount,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const DEVNET_CONFIG_PATH = path.join(__dirname, "../devnet-config.json");
const FAUCET_AMOUNT = 10_000; // 10,000 zkRUNE per request
const DECIMALS = 6;

interface DevnetConfig {
  tokenMint: string;
  stakingPool: string;
  mintAuthority: string;
  programId: string;
  network: string;
}

async function main() {
  const recipientAddress = process.argv[2];

  if (!recipientAddress) {
    console.log("zkRUNE Devnet Faucet");
    console.log("====================");
    console.log("");
    console.log("Usage: npx tsx scripts/faucet.ts <wallet_address> [amount]");
    console.log("");
    console.log("Examples:");
    console.log("  npx tsx scripts/faucet.ts 6FxmgP46a8SBfuZdfR9G8iAKfBsRR9Xeg9CuQjFc5xQ4");
    console.log("  npx tsx scripts/faucet.ts 6FxmgP46a8SBfuZdfR9G8iAKfBsRR9Xeg9CuQjFc5xQ4 5000");
    console.log("");
    console.log("Default amount: 10,000 zkRUNE");
    return;
  }

  // Load config
  if (!fs.existsSync(DEVNET_CONFIG_PATH)) {
    console.error("Error: devnet-config.json not found. Run setup-devnet.ts first.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(DEVNET_CONFIG_PATH, "utf-8")) as DevnetConfig;
  
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const wallet = provider.wallet as anchor.Wallet;
  const tokenMint = new PublicKey(config.tokenMint);
  
  let amount = FAUCET_AMOUNT;
  if (process.argv[3]) {
    amount = parseInt(process.argv[3]);
    if (isNaN(amount) || amount <= 0) {
      console.error("Error: Invalid amount");
      process.exit(1);
    }
  }

  let recipient: PublicKey;
  try {
    recipient = new PublicKey(recipientAddress);
  } catch {
    console.error("Error: Invalid wallet address");
    process.exit(1);
  }

  console.log("zkRUNE Devnet Faucet");
  console.log("====================");
  console.log("");
  console.log("Token Mint:", config.tokenMint);
  console.log("Recipient:", recipient.toString());
  console.log("Amount:", amount.toLocaleString(), "zkRUNE");
  console.log("");

  try {
    // Get or create recipient's token account
    console.log("[1/2] Getting recipient token account...");
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      recipient
    );
    console.log("      ATA:", recipientAta.address.toString());

    // Check current balance
    const balanceBefore = Number(recipientAta.amount) / Math.pow(10, DECIMALS);
    console.log("      Current balance:", balanceBefore.toLocaleString(), "zkRUNE");

    // Mint tokens
    console.log("[2/2] Minting tokens...");
    const rawAmount = amount * Math.pow(10, DECIMALS);
    
    const signature = await mintTo(
      provider.connection,
      wallet.payer,
      tokenMint,
      recipientAta.address,
      wallet.publicKey, // mint authority
      rawAmount
    );

    // Verify
    const accountInfo = await getAccount(provider.connection, recipientAta.address);
    const balanceAfter = Number(accountInfo.amount) / Math.pow(10, DECIMALS);

    console.log("");
    console.log("Success!");
    console.log("---------");
    console.log("Sent:", amount.toLocaleString(), "zkRUNE");
    console.log("New balance:", balanceAfter.toLocaleString(), "zkRUNE");
    console.log("Transaction:", signature);
    console.log("Solscan: https://solscan.io/tx/" + signature + "?cluster=devnet");
    console.log("");
    console.log("The recipient can now test staking at /staking");

  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
