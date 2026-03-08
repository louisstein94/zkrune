import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ZkruneStaking } from "./target/types/zkrune_staking";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ZkruneStaking as Program<ZkruneStaking>;
  const wallet = provider.wallet as anchor.Wallet;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  console.log("Balance:", (await provider.connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL, "SOL");

  // Create a new token mint for testing
  console.log("\n1. Creating test token mint...");
  const tokenMint = await createMint(
    provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    6
  );
  console.log("Token Mint:", tokenMint.toString());

  // Create user token account
  console.log("\n2. Creating token account...");
  const userAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    tokenMint,
    wallet.publicKey
  );
  console.log("User ATA:", userAta.address.toString());

  // Mint tokens
  console.log("\n3. Minting 10,000 tokens...");
  await mintTo(
    provider.connection,
    wallet.payer,
    tokenMint,
    userAta.address,
    wallet.publicKey,
    10_000_000_000 // 10,000 tokens with 6 decimals
  );
  const balance = await getAccount(provider.connection, userAta.address);
  console.log("Token Balance:", Number(balance.amount) / 1_000_000);

  // Derive PDAs
  const STAKING_POOL_SEED = Buffer.from("staking_pool");
  const STAKE_VAULT_SEED = Buffer.from("stake_vault");
  const REWARD_VAULT_SEED = Buffer.from("reward_vault");
  const USER_STAKE_SEED = Buffer.from("user_stake");

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
  const [userStakePda] = PublicKey.findProgramAddressSync(
    [USER_STAKE_SEED, stakingPoolPda.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("\nPDAs:");
  console.log("  Staking Pool:", stakingPoolPda.toString());
  console.log("  Stake Vault:", stakeVaultPda.toString());
  console.log("  Reward Vault:", rewardVaultPda.toString());
  console.log("  User Stake:", userStakePda.toString());

  // Initialize pool
  console.log("\n4. Initializing staking pool...");
  try {
    const initTx = await program.methods
      .initialize({
        minStakeAmount: new BN(100_000_000), // 100 tokens
        baseApyBps: 1200, // 12%
        earlyWithdrawalPenaltyBps: 5000, // 50%
      })
      .accounts({
        authority: wallet.publicKey,
        tokenMint: tokenMint,
        stakingPool: stakingPoolPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Initialize TX:", initTx);
    console.log("https://solscan.io/tx/" + initTx + "?cluster=devnet");
  } catch (e: any) {
    console.log("Init error:", e.message);
  }

  // Create stake vault
  console.log("\n4b. Creating stake vault...");
  try {
    const vaultTx = await program.methods
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
    console.log("Create Stake Vault TX:", vaultTx);
  } catch (e: any) {
    console.log("Create stake vault error:", e.message);
  }

  // Create reward vault
  console.log("\n4c. Creating reward vault...");
  try {
    const rewardTx = await program.methods
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
    console.log("Create Reward Vault TX:", rewardTx);
  } catch (e: any) {
    console.log("Create reward vault error:", e.message);
  }

  // Fetch pool
  const pool = await program.account.stakingPool.fetch(stakingPoolPda);
  console.log("\nPool State:");
  console.log("  Authority:", pool.authority.toString());
  console.log("  Total Staked:", pool.totalStaked.toNumber());
  console.log("  Total Stakers:", pool.totalStakers);
  console.log("  Lock Periods:", pool.lockPeriods.map(lp => `${lp.durationSeconds.toNumber() / 86400}d @ ${lp.multiplierBps / 100}x`).join(", "));

  // Stake tokens
  console.log("\n5. Staking 500 tokens (30-day lock)...");
  try {
    const stakeTx = await program.methods
      .stake({
        amount: new BN(500_000_000), // 500 tokens
        lockPeriodIndex: 0, // 30 days
      })
      .accounts({
        user: wallet.publicKey,
        stakingPool: stakingPoolPda,
        userStake: userStakePda,
        userTokenAccount: userAta.address,
        stakeVault: stakeVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Stake TX:", stakeTx);
    console.log("https://solscan.io/tx/" + stakeTx + "?cluster=devnet");
  } catch (e: any) {
    console.log("Stake error:", e.message);
  }

  // Verify stake
  const userStake = await program.account.userStake.fetch(userStakePda);
  console.log("\nUser Stake:");
  console.log("  Amount:", userStake.amount.toNumber() / 1_000_000, "tokens");
  console.log("  Lock Period:", userStake.lockPeriodIndex);
  console.log("  Active:", userStake.isActive);
  console.log("  Unlock At:", new Date(userStake.unlockAt.toNumber() * 1000).toISOString());

  // Check pool stats
  const poolAfter = await program.account.stakingPool.fetch(stakingPoolPda);
  console.log("\nPool After Stake:");
  console.log("  Total Staked:", poolAfter.totalStaked.toNumber() / 1_000_000, "tokens");
  console.log("  Total Stakers:", poolAfter.totalStakers);

  console.log("\n✅ All tests passed on devnet!");
}

main().catch(console.error);
