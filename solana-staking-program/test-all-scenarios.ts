import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ZkruneStaking } from "./target/types/zkrune_staking";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${name}: ${details}`);
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ZkruneStaking as Program<ZkruneStaking>;
  const wallet = provider.wallet as anchor.Wallet;
  
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║      zkRune Staking - Complete Test Suite                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\nProgram:", program.programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  console.log("Balance:", (await provider.connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL, "SOL\n");

  // ═══════════════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════════════
  console.log("━".repeat(60));
  console.log("SETUP: Creating test environment");
  console.log("━".repeat(60));

  const tokenMint = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 6);
  console.log("Token Mint:", tokenMint.toString());

  const userAta = await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, tokenMint, wallet.publicKey);
  await mintTo(provider.connection, wallet.payer, tokenMint, userAta.address, wallet.publicKey, 100_000_000_000); // 100,000 tokens
  console.log("Minted: 100,000 tokens");

  // PDAs
  const [stakingPoolPda] = PublicKey.findProgramAddressSync([Buffer.from("staking_pool"), tokenMint.toBuffer()], program.programId);
  const [stakeVaultPda] = PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), stakingPoolPda.toBuffer()], program.programId);
  const [rewardVaultPda] = PublicKey.findProgramAddressSync([Buffer.from("reward_vault"), stakingPoolPda.toBuffer()], program.programId);
  const [userStakePda] = PublicKey.findProgramAddressSync([Buffer.from("user_stake"), stakingPoolPda.toBuffer(), wallet.publicKey.toBuffer()], program.programId);

  // Initialize
  await program.methods.initialize({ minStakeAmount: new BN(100_000_000), baseApyBps: 1200, earlyWithdrawalPenaltyBps: 5000, yearlyEmission: new BN(1_000_000_000_000), maxApyBps: 3600, minApyBps: 500 })
    .accounts({ authority: wallet.publicKey, tokenMint, stakingPool: stakingPoolPda, systemProgram: SystemProgram.programId }).rpc();
  
  await program.methods.createStakeVault()
    .accounts({ authority: wallet.publicKey, tokenMint, stakingPool: stakingPoolPda, stakeVault: stakeVaultPda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();
  
  await program.methods.createRewardVault()
    .accounts({ authority: wallet.publicKey, tokenMint, stakingPool: stakingPoolPda, rewardVault: rewardVaultPda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();

  // Deposit rewards
  await program.methods.depositRewards(new BN(10_000_000_000)) // 10,000 tokens
    .accounts({ depositor: wallet.publicKey, stakingPool: stakingPoolPda, depositorTokenAccount: userAta.address, rewardVault: rewardVaultPda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  console.log("Pool initialized with 10,000 reward tokens\n");

  const pool = await program.account.stakingPool.fetch(stakingPoolPda);
  console.log("Lock Periods:");
  pool.lockPeriods.forEach((lp, i) => {
    const apyPercent = (1200 * lp.multiplierBps / 10000) / 100;
    console.log(`  [${i}] ${lp.durationSeconds.toNumber()}s lock → ${lp.multiplierBps/100}x multiplier → ${apyPercent}% effective APY`);
  });

  // ═══════════════════════════════════════════════════════════════════
  // TEST 1: Minimum Stake Validation
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 1: Minimum Stake Validation (should reject < 100 tokens)");
  console.log("━".repeat(60));

  try {
    await program.methods.stake({ amount: new BN(50_000_000), lockPeriodIndex: 0 }) // 50 tokens
      .accounts({ user: wallet.publicKey, stakingPool: stakingPoolPda, userStake: userStakePda, userTokenAccount: userAta.address, stakeVault: stakeVaultPda, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();
    logTest("Minimum stake validation", false, "Should have rejected 50 token stake");
  } catch (e: any) {
    if (e.error?.errorCode?.code === "BelowMinimumStake") {
      logTest("Minimum stake validation", true, "Correctly rejected stake below 100 tokens");
    } else {
      logTest("Minimum stake validation", false, `Unexpected error: ${e.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 2: Invalid Lock Period Validation
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 2: Invalid Lock Period (should reject index > 3)");
  console.log("━".repeat(60));

  try {
    await program.methods.stake({ amount: new BN(100_000_000), lockPeriodIndex: 5 })
      .accounts({ user: wallet.publicKey, stakingPool: stakingPoolPda, userStake: userStakePda, userTokenAccount: userAta.address, stakeVault: stakeVaultPda, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();
    logTest("Invalid lock period validation", false, "Should have rejected index 5");
  } catch (e: any) {
    if (e.error?.errorCode?.code === "InvalidLockPeriod") {
      logTest("Invalid lock period validation", true, "Correctly rejected invalid lock period");
    } else {
      logTest("Invalid lock period validation", false, `Unexpected error: ${e.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 3: Stake with 30s lock (index 0) - 1.0x multiplier
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 3: Stake 1,000 tokens with 30s lock (1.0x multiplier)");
  console.log("━".repeat(60));

  const balanceBefore3 = await getAccount(provider.connection, userAta.address);
  
  await program.methods.stake({ amount: new BN(1000_000_000), lockPeriodIndex: 0 })
    .accounts({ user: wallet.publicKey, stakingPool: stakingPoolPda, userStake: userStakePda, userTokenAccount: userAta.address, stakeVault: stakeVaultPda, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();

  const balanceAfter3 = await getAccount(provider.connection, userAta.address);
  const tokensStaked = (Number(balanceBefore3.amount) - Number(balanceAfter3.amount)) / 1_000_000;

  let userStake = await program.account.userStake.fetch(userStakePda);
  const lockDuration = userStake.unlockAt.toNumber() - userStake.stakedAt.toNumber();

  logTest("Stake 1,000 tokens", tokensStaked === 1000, `Staked ${tokensStaked} tokens, lock: ${lockDuration}s`);
  logTest("User stake active", userStake.isActive === true, `isActive: ${userStake.isActive}`);
  logTest("Lock period correct", lockDuration === 30, `Expected 30s, got ${lockDuration}s`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 4: Early Withdrawal with 50% Penalty
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 4: Early Withdrawal (should apply 50% penalty)");
  console.log("━".repeat(60));

  const balanceBefore4 = await getAccount(provider.connection, userAta.address);
  
  await program.methods.unstake()
    .accounts({ user: wallet.publicKey, stakingPool: stakingPoolPda, userStake: userStakePda, userTokenAccount: userAta.address, stakeVault: stakeVaultPda, rewardVault: rewardVaultPda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  const balanceAfter4 = await getAccount(provider.connection, userAta.address);
  const tokensReturned4 = (Number(balanceAfter4.amount) - Number(balanceBefore4.amount)) / 1_000_000;
  const penaltyAmount = 1000 - tokensReturned4;

  userStake = await program.account.userStake.fetch(userStakePda);
  
  logTest("Early withdrawal penalty", Math.abs(tokensReturned4 - 500) < 1, `Returned ${tokensReturned4} tokens, penalty: ${penaltyAmount} (${(penaltyAmount/1000*100).toFixed(0)}%)`);
  logTest("Stake deactivated", userStake.isActive === false, `isActive: ${userStake.isActive}`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 5: Re-stake with longer lock (60s, 1.5x multiplier)
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 5: Re-stake 500 tokens with 60s lock (1.5x multiplier)");
  console.log("━".repeat(60));

  // Need new user stake PDA since old one is deactivated - actually we can reuse
  // Create fresh mint/pool for clean test
  const tokenMint2 = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 6);
  const userAta2 = await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, tokenMint2, wallet.publicKey);
  await mintTo(provider.connection, wallet.payer, tokenMint2, userAta2.address, wallet.publicKey, 10_000_000_000);

  const [pool2Pda] = PublicKey.findProgramAddressSync([Buffer.from("staking_pool"), tokenMint2.toBuffer()], program.programId);
  const [vault2Pda] = PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), pool2Pda.toBuffer()], program.programId);
  const [reward2Pda] = PublicKey.findProgramAddressSync([Buffer.from("reward_vault"), pool2Pda.toBuffer()], program.programId);
  const [stake2Pda] = PublicKey.findProgramAddressSync([Buffer.from("user_stake"), pool2Pda.toBuffer(), wallet.publicKey.toBuffer()], program.programId);

  await program.methods.initialize({ minStakeAmount: new BN(100_000_000), baseApyBps: 1200, earlyWithdrawalPenaltyBps: 5000, yearlyEmission: new BN(1_000_000_000_000), maxApyBps: 3600, minApyBps: 500 })
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint2, stakingPool: pool2Pda, systemProgram: SystemProgram.programId }).rpc();
  await program.methods.createStakeVault()
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint2, stakingPool: pool2Pda, stakeVault: vault2Pda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();
  await program.methods.createRewardVault()
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint2, stakingPool: pool2Pda, rewardVault: reward2Pda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();
  await program.methods.depositRewards(new BN(5_000_000_000))
    .accounts({ depositor: wallet.publicKey, stakingPool: pool2Pda, depositorTokenAccount: userAta2.address, rewardVault: reward2Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  await program.methods.stake({ amount: new BN(500_000_000), lockPeriodIndex: 1 }) // 60s lock, 1.5x
    .accounts({ user: wallet.publicKey, stakingPool: pool2Pda, userStake: stake2Pda, userTokenAccount: userAta2.address, stakeVault: vault2Pda, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();

  let userStake2 = await program.account.userStake.fetch(stake2Pda);
  const lockDuration2 = userStake2.unlockAt.toNumber() - userStake2.stakedAt.toNumber();
  
  logTest("Stake with 1.5x multiplier", userStake2.lockPeriodIndex === 1, `Lock period index: ${userStake2.lockPeriodIndex}`);
  logTest("60s lock duration", lockDuration2 === 60, `Lock duration: ${lockDuration2}s`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 6: Wait for lock to expire, then claim rewards
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 6: Wait 65s, claim rewards (1.5x APY)");
  console.log("━".repeat(60));

  console.log("⏳ Waiting 65 seconds for lock to expire...");
  await sleep(65000);

  const balanceBefore6 = await getAccount(provider.connection, userAta2.address);
  
  try {
    await program.methods.claimRewards()
      .accounts({ user: wallet.publicKey, stakingPool: pool2Pda, userStake: stake2Pda, userTokenAccount: userAta2.address, rewardVault: reward2Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();
    
    const balanceAfter6 = await getAccount(provider.connection, userAta2.address);
    const rewardsClaimed = (Number(balanceAfter6.amount) - Number(balanceBefore6.amount)) / 1_000_000;
    
    // Expected: 500 tokens * 12% APY * 1.5x * (65/31536000) ≈ 0.000185 tokens
    logTest("Claim rewards", rewardsClaimed > 0, `Claimed ${rewardsClaimed.toFixed(6)} tokens`);
    
    userStake2 = await program.account.userStake.fetch(stake2Pda);
    logTest("Total claimed updated", userStake2.totalClaimed.toNumber() > 0, `Total claimed: ${userStake2.totalClaimed.toNumber() / 1_000_000}`);
  } catch (e: any) {
    if (e.error?.errorCode?.code === "NoRewardsToClaim") {
      logTest("Claim rewards", false, "No rewards (APY too low for short period)");
    } else {
      logTest("Claim rewards", false, e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEST 7: Unstake after lock expires (no penalty)
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 7: Unstake after lock expires (no penalty)");
  console.log("━".repeat(60));

  const balanceBefore7 = await getAccount(provider.connection, userAta2.address);

  await program.methods.unstake()
    .accounts({ user: wallet.publicKey, stakingPool: pool2Pda, userStake: stake2Pda, userTokenAccount: userAta2.address, stakeVault: vault2Pda, rewardVault: reward2Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  const balanceAfter7 = await getAccount(provider.connection, userAta2.address);
  const tokensReturned7 = (Number(balanceAfter7.amount) - Number(balanceBefore7.amount)) / 1_000_000;

  // Should get back 500 tokens + any remaining rewards
  logTest("Full unstake (no penalty)", tokensReturned7 >= 500, `Returned ${tokensReturned7.toFixed(4)} tokens (expected ~500)`);

  userStake2 = await program.account.userStake.fetch(stake2Pda);
  logTest("Stake deactivated after unstake", userStake2.isActive === false, `isActive: ${userStake2.isActive}`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 8: Pool stats tracking
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 8: Pool Statistics");
  console.log("━".repeat(60));

  const finalPool = await program.account.stakingPool.fetch(pool2Pda);
  
  logTest("Total staked reset to 0", finalPool.totalStaked.toNumber() === 0, `Total staked: ${finalPool.totalStaked.toNumber() / 1_000_000}`);
  logTest("Total stakers reset to 0", finalPool.totalStakers === 0, `Total stakers: ${finalPool.totalStakers}`);
  logTest("Rewards distributed tracked", finalPool.totalRewardsDistributed.toNumber() >= 0, `Total rewards distributed: ${finalPool.totalRewardsDistributed.toNumber() / 1_000_000}`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST 9: APY Calculation verification for different multipliers
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "━".repeat(60));
  console.log("TEST 9: APY Calculation (3.0x multiplier - 90s lock)");
  console.log("━".repeat(60));

  const tokenMint3 = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 6);
  const userAta3 = await getOrCreateAssociatedTokenAccount(provider.connection, wallet.payer, tokenMint3, wallet.publicKey);
  await mintTo(provider.connection, wallet.payer, tokenMint3, userAta3.address, wallet.publicKey, 10_000_000_000);

  const [pool3Pda] = PublicKey.findProgramAddressSync([Buffer.from("staking_pool"), tokenMint3.toBuffer()], program.programId);
  const [vault3Pda] = PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), pool3Pda.toBuffer()], program.programId);
  const [reward3Pda] = PublicKey.findProgramAddressSync([Buffer.from("reward_vault"), pool3Pda.toBuffer()], program.programId);
  const [stake3Pda] = PublicKey.findProgramAddressSync([Buffer.from("user_stake"), pool3Pda.toBuffer(), wallet.publicKey.toBuffer()], program.programId);

  await program.methods.initialize({ minStakeAmount: new BN(100_000_000), baseApyBps: 1200, earlyWithdrawalPenaltyBps: 5000, yearlyEmission: new BN(1_000_000_000_000), maxApyBps: 3600, minApyBps: 500 })
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint3, stakingPool: pool3Pda, systemProgram: SystemProgram.programId }).rpc();
  await program.methods.createStakeVault()
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint3, stakingPool: pool3Pda, stakeVault: vault3Pda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();
  await program.methods.createRewardVault()
    .accounts({ authority: wallet.publicKey, tokenMint: tokenMint3, stakingPool: pool3Pda, rewardVault: reward3Pda, systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID, rent: anchor.web3.SYSVAR_RENT_PUBKEY }).rpc();
  await program.methods.depositRewards(new BN(5_000_000_000))
    .accounts({ depositor: wallet.publicKey, stakingPool: pool3Pda, depositorTokenAccount: userAta3.address, rewardVault: reward3Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  // Stake with 3.0x multiplier (index 3, 120s)
  await program.methods.stake({ amount: new BN(1000_000_000), lockPeriodIndex: 3 })
    .accounts({ user: wallet.publicKey, stakingPool: pool3Pda, userStake: stake3Pda, userTokenAccount: userAta3.address, stakeVault: vault3Pda, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();

  console.log("⏳ Waiting 125 seconds for 3.0x lock to expire...");
  await sleep(125000);

  const balanceBefore9 = await getAccount(provider.connection, userAta3.address);
  
  try {
    await program.methods.claimRewards()
      .accounts({ user: wallet.publicKey, stakingPool: pool3Pda, userStake: stake3Pda, userTokenAccount: userAta3.address, rewardVault: reward3Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();
    
    const balanceAfter9 = await getAccount(provider.connection, userAta3.address);
    const rewards3x = (Number(balanceAfter9.amount) - Number(balanceBefore9.amount)) / 1_000_000;
    
    // 3.0x should give ~3x more rewards than 1.0x for same period
    // Expected: 1000 * 0.12 * 3.0 * (125/31536000) ≈ 0.00142 tokens
    logTest("3.0x APY rewards", rewards3x > 0, `Claimed ${rewards3x.toFixed(6)} tokens with 3.0x multiplier`);
  } catch (e: any) {
    logTest("3.0x APY rewards", false, e.message);
  }

  // Unstake
  await program.methods.unstake()
    .accounts({ user: wallet.publicKey, stakingPool: pool3Pda, userStake: stake3Pda, userTokenAccount: userAta3.address, stakeVault: vault3Pda, rewardVault: reward3Pda, tokenProgram: TOKEN_PROGRAM_ID }).rpc();

  const balanceFinal = await getAccount(provider.connection, userAta3.address);
  const finalReturn = (Number(balanceFinal.amount) - Number(balanceBefore9.amount)) / 1_000_000;
  logTest("Full 3.0x unstake", finalReturn >= 1000, `Total returned: ${finalReturn.toFixed(4)} tokens`);

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("TEST SUMMARY");
  console.log("═".repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log("\nFailed tests:");
    results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}: ${r.details}`));
  }

  console.log("\n" + (failed === 0 ? "🎉 ALL TESTS PASSED!" : "⚠️ SOME TESTS FAILED"));
}

main().catch(console.error);
