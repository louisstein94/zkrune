import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ZkruneStaking } from "./target/types/zkrune_staking";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function sleep(ms: number) {
  console.log(`⏳ Waiting ${ms/1000} seconds...`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ZkruneStaking as Program<ZkruneStaking>;
  const wallet = provider.wallet as anchor.Wallet;
  
  console.log("=".repeat(60));
  console.log("zkRune Staking - Full Cycle Test (Short Lock Periods)");
  console.log("=".repeat(60));
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  console.log("Balance:", (await provider.connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL, "SOL");

  // Create a new token mint for testing
  console.log("\n📦 SETUP: Creating test token mint...");
  const tokenMint = await createMint(
    provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    6
  );
  console.log("Token Mint:", tokenMint.toString());

  // Create user token account
  const userAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    tokenMint,
    wallet.publicKey
  );

  // Mint tokens
  await mintTo(
    provider.connection,
    wallet.payer,
    tokenMint,
    userAta.address,
    wallet.publicKey,
    10_000_000_000 // 10,000 tokens
  );
  console.log("Minted 10,000 tokens to user");

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

  // ============ STEP 1: Initialize Pool ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: Initialize Staking Pool");
  console.log("=".repeat(60));
  
  await program.methods
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
  console.log("✅ Pool initialized");

  // Create vaults
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
  console.log("✅ Stake vault created");

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
  console.log("✅ Reward vault created");

  // Fetch pool state
  let pool = await program.account.stakingPool.fetch(stakingPoolPda);
  console.log("\nLock Periods (TEST MODE):");
  pool.lockPeriods.forEach((lp, i) => {
    console.log(`  [${i}] ${lp.durationSeconds.toNumber()} seconds @ ${lp.multiplierBps / 100}x multiplier`);
  });

  // ============ STEP 2: Deposit Rewards ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Deposit Rewards to Pool");
  console.log("=".repeat(60));

  const depositorAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    tokenMint,
    wallet.publicKey
  );

  await program.methods
    .depositRewards(new BN(1000_000_000)) // 1000 tokens as rewards
    .accounts({
      depositor: wallet.publicKey,
      stakingPool: stakingPoolPda,
      depositorTokenAccount: depositorAta.address,
      rewardVault: rewardVaultPda,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  console.log("✅ Deposited 1,000 tokens to reward pool");

  // ============ STEP 3: Stake Tokens ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Stake 500 Tokens (30-second lock)");
  console.log("=".repeat(60));

  const balanceBefore = await getAccount(provider.connection, userAta.address);
  console.log("Token balance before:", Number(balanceBefore.amount) / 1_000_000);

  await program.methods
    .stake({
      amount: new BN(500_000_000), // 500 tokens
      lockPeriodIndex: 0, // 30 seconds
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
  console.log("✅ Staked 500 tokens");

  const balanceAfter = await getAccount(provider.connection, userAta.address);
  console.log("Token balance after:", Number(balanceAfter.amount) / 1_000_000);

  let userStake = await program.account.userStake.fetch(userStakePda);
  const unlockTime = new Date(userStake.unlockAt.toNumber() * 1000);
  console.log("Unlock time:", unlockTime.toISOString());
  console.log("Lock duration:", userStake.unlockAt.toNumber() - userStake.stakedAt.toNumber(), "seconds");

  // ============ STEP 4: Try Early Unstake (with penalty) ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: Wait for Lock Period to Expire");
  console.log("=".repeat(60));

  await sleep(35000); // Wait 35 seconds

  // ============ STEP 5: Claim Rewards ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: Claim Rewards");
  console.log("=".repeat(60));

  try {
    await program.methods
      .claimRewards()
      .accounts({
        user: wallet.publicKey,
        stakingPool: stakingPoolPda,
        userStake: userStakePda,
        userTokenAccount: userAta.address,
        rewardVault: rewardVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    const balanceAfterClaim = await getAccount(provider.connection, userAta.address);
    const rewardsClaimed = (Number(balanceAfterClaim.amount) - Number(balanceAfter.amount)) / 1_000_000;
    console.log("✅ Claimed rewards:", rewardsClaimed, "tokens");
  } catch (e: any) {
    if (e.error?.errorCode?.code === "NoRewardsToClaim") {
      console.log("⚠️ No rewards to claim (APY too low for short period)");
    } else {
      throw e;
    }
  }

  // ============ STEP 6: Unstake (no penalty - lock expired) ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 6: Unstake (Lock Expired - No Penalty)");
  console.log("=".repeat(60));

  const balanceBeforeUnstake = await getAccount(provider.connection, userAta.address);
  console.log("Balance before unstake:", Number(balanceBeforeUnstake.amount) / 1_000_000);

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
  console.log("✅ Unstaked successfully");

  const balanceAfterUnstake = await getAccount(provider.connection, userAta.address);
  const tokensReturned = (Number(balanceAfterUnstake.amount) - Number(balanceBeforeUnstake.amount)) / 1_000_000;
  console.log("Balance after unstake:", Number(balanceAfterUnstake.amount) / 1_000_000);
  console.log("Tokens returned:", tokensReturned);

  if (tokensReturned >= 500) {
    console.log("✅ Full amount returned (no penalty applied)");
  } else {
    console.log("⚠️ Penalty was applied:", 500 - tokensReturned, "tokens");
  }

  // Final state
  userStake = await program.account.userStake.fetch(userStakePda);
  pool = await program.account.stakingPool.fetch(stakingPoolPda);

  console.log("\n" + "=".repeat(60));
  console.log("FINAL STATE");
  console.log("=".repeat(60));
  console.log("User stake active:", userStake.isActive);
  console.log("Pool total staked:", pool.totalStaked.toNumber() / 1_000_000, "tokens");
  console.log("Pool total stakers:", pool.totalStakers);
  console.log("Pool rewards distributed:", pool.totalRewardsDistributed.toNumber() / 1_000_000, "tokens");

  console.log("\n🎉 Full cycle test completed successfully!");
}

main().catch(console.error);
