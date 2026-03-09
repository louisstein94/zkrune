// @ts-nocheck
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ZkruneStaking } from "../target/types/zkrune_staking";
import { 
  Keypair, 
  SystemProgram, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const DEVNET_CONFIG_PATH = path.join(__dirname, "../devnet-config.json");

interface DevnetConfig {
  tokenMint: string;
  stakingPool: string;
  stakeVault: string;
  rewardVault: string;
  mintAuthority: string;
  programId: string;
  network: string;
  createdAt: string;
}

async function main() {
  console.log("=".repeat(60));
  console.log("zkRUNE Devnet Setup - Creating Test Token & Staking Pool");
  console.log("=".repeat(60));

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ZkruneStaking as Program<ZkruneStaking>;
  const wallet = provider.wallet as anchor.Wallet;

  console.log("\nProgram ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  console.log("Balance:", (await provider.connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL, "SOL");

  // Check if config already exists
  if (fs.existsSync(DEVNET_CONFIG_PATH)) {
    const existing = JSON.parse(fs.readFileSync(DEVNET_CONFIG_PATH, "utf-8")) as DevnetConfig;
    console.log("\n[!] Existing devnet config found:");
    console.log("    Token Mint:", existing.tokenMint);
    console.log("    Staking Pool:", existing.stakingPool);
    
    const poolAccount = await provider.connection.getAccountInfo(new PublicKey(existing.stakingPool));
    if (poolAccount) {
      console.log("\n[OK] Staking pool already exists. Use 'faucet' command to get test tokens.");
      return;
    }
    console.log("\n[!] Pool not found on-chain. Recreating...");
  }

  // Step 1: Create zkRUNE test token mint
  console.log("\n[1/5] Creating zkRUNE test token mint...");
  
  const tokenMint = await createMint(
    provider.connection,
    wallet.payer,
    wallet.publicKey, // mint authority
    null, // freeze authority
    6 // decimals (same as real zkRUNE)
  );
  console.log("    Token Mint:", tokenMint.toString());

  // Step 2: Derive PDAs
  console.log("\n[2/5] Deriving PDAs...");
  
  const STAKING_POOL_SEED = Buffer.from("staking_pool");
  const STAKE_VAULT_SEED = Buffer.from("stake_vault");
  const REWARD_VAULT_SEED = Buffer.from("reward_vault");

  const [stakingPoolPda] = PublicKey.findProgramAddressSync(
    [STAKING_POOL_SEED, tokenMint.toBuffer()],
    program.programId
  );
  const [stakeVaultPda] = PublicKey.findProgramAddressSync(
    [STAKE_VAULT_SEED, stakingPoolPda.toBuffer()],
    program.programId
  );
  const [rewardVaultPda] = PublicKey.findProgramAddressSync(
    [REWARD_VAULT_SEED, stakingPoolPda.toBuffer()],
    program.programId
  );

  console.log("    Staking Pool:", stakingPoolPda.toString());
  console.log("    Stake Vault:", stakeVaultPda.toString());
  console.log("    Reward Vault:", rewardVaultPda.toString());

  // Step 3: Initialize staking pool
  console.log("\n[3/5] Initializing staking pool...");
  
  await program.methods
    .initialize({
      minStakeAmount: new BN(100_000_000), // 100 tokens minimum
      baseApyBps: 1200, // 12% base APY
      earlyWithdrawalPenaltyBps: 5000, // 50% penalty
      yearlyEmission: new BN(1_000_000_000_000), // 1M tokens/year
      maxApyBps: 3600, // 36% max APY
      minApyBps: 500, // 5% min APY
    })
    .accounts({
      authority: wallet.publicKey,
      tokenMint: tokenMint,
      stakingPool: stakingPoolPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("    Pool initialized");

  // Create vaults
  console.log("\n[4/5] Creating token vaults...");
  
  await program.methods
    .createStakeVault()
    .accounts({
      authority: wallet.publicKey,
      tokenMint: tokenMint,
      stakingPool: stakingPoolPda,
      stakeVault: stakeVaultPda,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
  console.log("    Stake vault created");

  await program.methods
    .createRewardVault()
    .accounts({
      authority: wallet.publicKey,
      tokenMint: tokenMint,
      stakingPool: stakingPoolPda,
      rewardVault: rewardVaultPda,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
  console.log("    Reward vault created");

  // Step 4: Mint initial reward tokens and deposit
  console.log("\n[5/5] Depositing initial rewards...");
  
  const adminAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    tokenMint,
    wallet.publicKey
  );

  // Mint 1,000,000 tokens for rewards
  await mintTo(
    provider.connection,
    wallet.payer,
    tokenMint,
    adminAta.address,
    wallet.publicKey,
    1_000_000_000_000 // 1,000,000 tokens
  );

  // Deposit 100,000 tokens to reward pool
  await program.methods
    .depositRewards(new BN(100_000_000_000)) // 100,000 tokens
    .accounts({
      depositor: wallet.publicKey,
      stakingPool: stakingPoolPda,
      depositorTokenAccount: adminAta.address,
      rewardVault: rewardVaultPda,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  console.log("    Deposited 100,000 zkRUNE to reward pool");

  // Save config
  const config: DevnetConfig = {
    tokenMint: tokenMint.toString(),
    stakingPool: stakingPoolPda.toString(),
    stakeVault: stakeVaultPda.toString(),
    rewardVault: rewardVaultPda.toString(),
    mintAuthority: wallet.publicKey.toString(),
    programId: program.programId.toString(),
    network: "devnet",
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(DEVNET_CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("\n[OK] Config saved to:", DEVNET_CONFIG_PATH);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEVNET SETUP COMPLETE");
  console.log("=".repeat(60));
  console.log("\nzkRUNE Test Token:");
  console.log("  Mint:", tokenMint.toString());
  console.log("  Decimals: 6");
  console.log("  Symbol: zkRUNE (test)");
  console.log("\nStaking Pool:");
  console.log("  Address:", stakingPoolPda.toString());
  console.log("  Min Stake: 100 zkRUNE");
  console.log("  Base APY: 12%");
  console.log("  Reward Pool: 100,000 zkRUNE");
  console.log("\nFaucet (admin wallet):");
  console.log("  Address:", wallet.publicKey.toString());
  console.log("  Available: 900,000 zkRUNE");
  console.log("\nNext steps:");
  console.log("  1. Update frontend .env with NEXT_PUBLIC_ZKRUNE_MINT=" + tokenMint.toString());
  console.log("  2. Run 'npx tsx scripts/faucet.ts <wallet_address>' to send test tokens");
  console.log("  3. Users can test staking at /staking");
}

main().catch(console.error);
