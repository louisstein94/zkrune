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
  
  console.log("=".repeat(60));
  console.log("zkRune Staking - Early Withdrawal Penalty Test");
  console.log("=".repeat(60));
  console.log("Program ID:", program.programId.toString());

  // Create a new token mint for testing
  console.log("\n📦 SETUP...");
  const tokenMint = await createMint(
    provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    6
  );

  const userAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    tokenMint,
    wallet.publicKey
  );

  await mintTo(
    provider.connection,
    wallet.payer,
    tokenMint,
    userAta.address,
    wallet.publicKey,
    10_000_000_000
  );

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

  // Initialize pool with 50% early withdrawal penalty
  await program.methods
    .initialize({
      minStakeAmount: new BN(100_000_000),
      baseApyBps: 1200,
      earlyWithdrawalPenaltyBps: 5000, // 50%
    })
    .accounts({
      authority: wallet.publicKey,
      tokenMint: tokenMint,
      stakingPool: stakingPoolPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

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
  console.log("✅ Pool initialized with 50% early withdrawal penalty");

  // Stake with 120 second lock (longest)
  console.log("\n📥 Staking 1,000 tokens with 120-second lock...");
  await program.methods
    .stake({
      amount: new BN(1000_000_000), // 1000 tokens
      lockPeriodIndex: 3, // 120 seconds
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

  const balanceBefore = await getAccount(provider.connection, userAta.address);
  console.log("Balance after staking:", Number(balanceBefore.amount) / 1_000_000, "tokens");

  // Immediately unstake (early withdrawal)
  console.log("\n⚠️ EARLY UNSTAKE (immediately, before lock expires)...");
  await program.methods
    .unstake()
    .accounts({
      user: wallet.publicKey,
      stakingPool: stakingPoolPda,
      userStake: userStakePda,
      userTokenAccount: userAta.address,
      stakeVault: stakeVaultPda,
      rewardVault: rewardVaultPda,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  const balanceAfter = await getAccount(provider.connection, userAta.address);
  const tokensReturned = (Number(balanceAfter.amount) - Number(balanceBefore.amount)) / 1_000_000;
  
  console.log("\n" + "=".repeat(60));
  console.log("PENALTY TEST RESULTS");
  console.log("=".repeat(60));
  console.log("Staked amount:", 1000, "tokens");
  console.log("Tokens returned:", tokensReturned, "tokens");
  console.log("Penalty applied:", 1000 - tokensReturned, "tokens (", ((1000 - tokensReturned) / 1000 * 100).toFixed(0), "%)");
  
  if (Math.abs(tokensReturned - 500) < 1) {
    console.log("\n✅ 50% PENALTY CORRECTLY APPLIED!");
  } else {
    console.log("\n❌ Unexpected penalty amount");
  }
}

main().catch(console.error);
