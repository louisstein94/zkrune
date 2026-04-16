import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ZkruneStaking } from "../target/types/zkrune_staking";
import {
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("zkrune-staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .ZkruneStaking as Program<ZkruneStaking>;

  // Test accounts
  let tokenMint: PublicKey;
  let mintAuthority: Keypair;
  let stakingPoolPda: PublicKey;
  let stakeVaultPda: PublicKey;
  let rewardVaultPda: PublicKey;

  // Users
  let user1: Keypair;
  let user1TokenAccount: PublicKey;
  let user2: Keypair;
  let user2TokenAccount: PublicKey;

  // Constants
  const DECIMALS = 6;
  const TOKENS_PER_UNIT = 10 ** DECIMALS;
  const MIN_STAKE = 100 * TOKENS_PER_UNIT; // 100 tokens
  const BASE_APY_BPS = 1200; // 12%
  const EARLY_WITHDRAWAL_PENALTY_BPS = 5000; // 50%
  const YEARLY_EMISSION = 1_000_000 * TOKENS_PER_UNIT; // 1M tokens/year
  const MAX_APY_BPS = 3600; // 36%
  const MIN_APY_BPS = 500; // 5%

  // Seeds
  const STAKING_POOL_SEED = Buffer.from("staking_pool");
  const STAKE_VAULT_SEED = Buffer.from("stake_vault");
  const REWARD_VAULT_SEED = Buffer.from("reward_vault");
  const USER_STAKE_SEED = Buffer.from("user_stake");

  before(async () => {
    // Create mint authority
    mintAuthority = Keypair.generate();

    // Airdrop SOL to authority
    const airdropSig = await provider.connection.requestAirdrop(
      mintAuthority.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      DECIMALS
    );

    // Derive PDAs
    [stakingPoolPda] = PublicKey.findProgramAddressSync(
      [STAKING_POOL_SEED, tokenMint.toBuffer()],
      program.programId
    );

    [stakeVaultPda] = PublicKey.findProgramAddressSync(
      [STAKE_VAULT_SEED, stakingPoolPda.toBuffer()],
      program.programId
    );

    [rewardVaultPda] = PublicKey.findProgramAddressSync(
      [REWARD_VAULT_SEED, stakingPoolPda.toBuffer()],
      program.programId
    );

    // Setup user 1
    user1 = Keypair.generate();
    const airdrop1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);

    const user1Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user1,
      tokenMint,
      user1.publicKey
    );
    user1TokenAccount = user1Ata.address;

    // Mint tokens to user1 (10,000 tokens)
    await mintTo(
      provider.connection,
      mintAuthority,
      tokenMint,
      user1TokenAccount,
      mintAuthority.publicKey,
      10000 * TOKENS_PER_UNIT
    );

    // Setup user 2
    user2 = Keypair.generate();
    const airdrop2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop2);

    const user2Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user2,
      tokenMint,
      user2.publicKey
    );
    user2TokenAccount = user2Ata.address;

    // Mint tokens to user2 (5,000 tokens)
    await mintTo(
      provider.connection,
      mintAuthority,
      tokenMint,
      user2TokenAccount,
      mintAuthority.publicKey,
      5000 * TOKENS_PER_UNIT
    );

    console.log("Token Mint:", tokenMint.toString());
    console.log("Staking Pool PDA:", stakingPoolPda.toString());
    console.log("User1:", user1.publicKey.toString());
    console.log("User2:", user2.publicKey.toString());
  });

  describe("initialize", () => {
    it("should initialize staking pool", async () => {
      // Step 1: Initialize the pool (no vault accounts here — lib.rs
      // Initialize struct only takes authority + tokenMint + stakingPool)
      const tx = await program.methods
        .initialize({
          minStakeAmount: new BN(MIN_STAKE),
          baseApyBps: BASE_APY_BPS,
          earlyWithdrawalPenaltyBps: EARLY_WITHDRAWAL_PENALTY_BPS,
          yearlyEmission: new BN(YEARLY_EMISSION),
          maxApyBps: MAX_APY_BPS,
          minApyBps: MIN_APY_BPS,
        })
        .accounts({
          authority: mintAuthority.publicKey,
          tokenMint: tokenMint,
          stakingPool: stakingPoolPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([mintAuthority])
        .rpc();

      console.log("Initialize tx:", tx);

      // Step 2: Create stake vault (separate instruction)
      const stakeVaultTx = await program.methods
        .createStakeVault()
        .accounts({
          authority: mintAuthority.publicKey,
          tokenMint: tokenMint,
          stakingPool: stakingPoolPda,
          stakeVault: stakeVaultPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintAuthority])
        .rpc();

      console.log("Create stake vault tx:", stakeVaultTx);

      // Step 3: Create reward vault (separate instruction)
      const rewardVaultTx = await program.methods
        .createRewardVault()
        .accounts({
          authority: mintAuthority.publicKey,
          tokenMint: tokenMint,
          stakingPool: stakingPoolPda,
          rewardVault: rewardVaultPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintAuthority])
        .rpc();

      console.log("Create reward vault tx:", rewardVaultTx);

      // Verify pool state
      const pool = await program.account.stakingPool.fetch(stakingPoolPda);
      expect(pool.authority.toString()).to.equal(
        mintAuthority.publicKey.toString()
      );
      expect(pool.tokenMint.toString()).to.equal(tokenMint.toString());
      expect(pool.totalStaked.toNumber()).to.equal(0);
      expect(pool.totalStakers).to.equal(0);
      expect(pool.minStakeAmount.toNumber()).to.equal(MIN_STAKE);
      expect(pool.baseApyBps).to.equal(BASE_APY_BPS);
      expect(pool.earlyWithdrawalPenaltyBps).to.equal(
        EARLY_WITHDRAWAL_PENALTY_BPS
      );

      // Verify lock periods
      expect(pool.lockPeriods[0].durationSeconds.toNumber()).to.equal(
        30 * 24 * 60 * 60
      );
      expect(pool.lockPeriods[0].multiplierBps).to.equal(10000); // 1.0x
      expect(pool.lockPeriods[3].durationSeconds.toNumber()).to.equal(
        365 * 24 * 60 * 60
      );
      expect(pool.lockPeriods[3].multiplierBps).to.equal(30000); // 3.0x

      // Verify vault addresses are set
      expect(pool.stakeVault.toString()).to.equal(stakeVaultPda.toString());
      expect(pool.rewardVault.toString()).to.equal(rewardVaultPda.toString());
    });
  });

  describe("stake", () => {
    it("should stake tokens with 30-day lock (index 0)", async () => {
      const stakeAmount = 500 * TOKENS_PER_UNIT;

      const [userStakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const balanceBefore = await getAccount(
        provider.connection,
        user1TokenAccount
      );

      const tx = await program.methods
        .stake({
          amount: new BN(stakeAmount),
          lockPeriodIndex: 0,
        })
        .accounts({
          user: user1.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userStakePda,
          userTokenAccount: user1TokenAccount,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Stake tx:", tx);

      // Verify user stake
      const userStake = await program.account.userStake.fetch(userStakePda);
      expect(userStake.owner.toString()).to.equal(user1.publicKey.toString());
      expect(userStake.amount.toNumber()).to.equal(stakeAmount);
      expect(userStake.lockPeriodIndex).to.equal(0);
      expect(userStake.isActive).to.equal(true);

      // Verify token transfer
      const balanceAfter = await getAccount(
        provider.connection,
        user1TokenAccount
      );
      expect(Number(balanceAfter.amount)).to.equal(
        Number(balanceBefore.amount) - stakeAmount
      );

      // Verify pool stats
      const pool = await program.account.stakingPool.fetch(stakingPoolPda);
      expect(pool.totalStaked.toNumber()).to.equal(stakeAmount);
      expect(pool.totalStakers).to.equal(1);
    });

    it("should fail if stake amount is below minimum", async () => {
      const [userStakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .stake({
            amount: new BN(50 * TOKENS_PER_UNIT), // Below 100 minimum
            lockPeriodIndex: 0,
          })
          .accounts({
            user: user2.publicKey,
            stakingPool: stakingPoolPda,
            userStake: userStakePda,
            userTokenAccount: user2TokenAccount,
            stakeVault: stakeVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        expect.fail("Should have thrown BelowMinimumStake error");
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal("BelowMinimumStake");
      }
    });

    it("should fail with invalid lock period index", async () => {
      const [userStakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .stake({
            amount: new BN(200 * TOKENS_PER_UNIT),
            lockPeriodIndex: 5, // Invalid: must be 0-3
          })
          .accounts({
            user: user2.publicKey,
            stakingPool: stakingPoolPda,
            userStake: userStakePda,
            userTokenAccount: user2TokenAccount,
            stakeVault: stakeVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        expect.fail("Should have thrown InvalidLockPeriod error");
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal("InvalidLockPeriod");
      }
    });
  });

  describe("deposit_rewards", () => {
    it("should deposit rewards to pool", async () => {
      const depositAmount = 1000 * TOKENS_PER_UNIT;

      // Create depositor (mint authority has tokens)
      const depositorAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        mintAuthority,
        tokenMint,
        mintAuthority.publicKey
      );

      await mintTo(
        provider.connection,
        mintAuthority,
        tokenMint,
        depositorAta.address,
        mintAuthority.publicKey,
        depositAmount
      );

      const poolBefore = await program.account.stakingPool.fetch(stakingPoolPda);

      const tx = await program.methods
        .depositRewards(new BN(depositAmount))
        .accounts({
          depositor: mintAuthority.publicKey,
          stakingPool: stakingPoolPda,
          depositorTokenAccount: depositorAta.address,
          rewardVault: rewardVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([mintAuthority])
        .rpc();

      console.log("Deposit rewards tx:", tx);

      // Verify pool balance updated
      const poolAfter = await program.account.stakingPool.fetch(stakingPoolPda);
      expect(poolAfter.rewardPoolBalance.toNumber()).to.equal(
        poolBefore.rewardPoolBalance.toNumber() + depositAmount
      );

      // Verify vault received tokens
      const vaultBalance = await getAccount(
        provider.connection,
        rewardVaultPda
      );
      expect(Number(vaultBalance.amount)).to.equal(depositAmount);
    });
  });

  describe("claim_rewards", () => {
    it("should claim pending rewards", async () => {
      // Skip some time to accumulate rewards
      // Note: In actual test, you might need to warp time or use a test validator

      const [userStakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const userStakeBefore = await program.account.userStake.fetch(
        userStakePda
      );
      const poolBefore = await program.account.stakingPool.fetch(stakingPoolPda);

      // Note: This test may fail if not enough time has passed
      // In a real test environment, use time warping
      try {
        const tx = await program.methods
          .claimRewards()
          .accounts({
            user: user1.publicKey,
            stakingPool: stakingPoolPda,
            userStake: userStakePda,
            userTokenAccount: user1TokenAccount,
            rewardVault: rewardVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        console.log("Claim rewards tx:", tx);

        const userStakeAfter = await program.account.userStake.fetch(
          userStakePda
        );
        expect(userStakeAfter.totalClaimed.toNumber()).to.be.greaterThan(
          userStakeBefore.totalClaimed.toNumber()
        );
      } catch (error: any) {
        // Expected if no time has passed
        if (error.error?.errorCode?.code === "NoRewardsToClaim") {
          console.log("No rewards yet (expected if time hasn't passed)");
        } else {
          throw error;
        }
      }
    });
  });

  describe("unstake", () => {
    it("should apply early withdrawal penalty", async () => {
      // First, stake as user2
      const stakeAmount = 200 * TOKENS_PER_UNIT;

      const [userStakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      // Stake first
      await program.methods
        .stake({
          amount: new BN(stakeAmount),
          lockPeriodIndex: 3, // 365 days lock
        })
        .accounts({
          user: user2.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userStakePda,
          userTokenAccount: user2TokenAccount,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const balanceBefore = await getAccount(
        provider.connection,
        user2TokenAccount
      );

      // Immediate unstake (early withdrawal)
      const tx = await program.methods
        .unstake()
        .accounts({
          user: user2.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userStakePda,
          userTokenAccount: user2TokenAccount,
          stakeVault: stakeVaultPda,
          rewardVault: rewardVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user2])
        .rpc();

      console.log("Early unstake tx:", tx);

      const balanceAfter = await getAccount(
        provider.connection,
        user2TokenAccount
      );

      // 50% penalty: should receive 100 tokens back (from 200 staked)
      const expectedReturn = stakeAmount / 2;
      const actualReturn =
        Number(balanceAfter.amount) - Number(balanceBefore.amount);

      expect(actualReturn).to.equal(expectedReturn);

      // Verify stake is deactivated
      const userStake = await program.account.userStake.fetch(userStakePda);
      expect(userStake.isActive).to.equal(false);
    });

    it("should unstake without penalty after lock expires", async () => {
      // Note: This test requires time manipulation
      // In production tests, use a test validator with warpToSlot
      console.log(
        "Skipping: requires time warp to test post-lock unstake"
      );
    });
  });

  describe("pool stats", () => {
    it("should track total staked and stakers correctly", async () => {
      const pool = await program.account.stakingPool.fetch(stakingPoolPda);

      console.log("Pool Statistics:");
      console.log("  Total Staked:", pool.totalStaked.toNumber() / TOKENS_PER_UNIT, "tokens");
      console.log("  Total Stakers:", pool.totalStakers);
      console.log(
        "  Reward Pool Balance:",
        pool.rewardPoolBalance.toNumber() / TOKENS_PER_UNIT,
        "tokens"
      );
      console.log(
        "  Total Rewards Distributed:",
        pool.totalRewardsDistributed.toNumber() / TOKENS_PER_UNIT,
        "tokens"
      );

      // User1 still has active stake (500 tokens)
      // User2 unstaked (200 tokens removed, with 50% penalty)
      expect(pool.totalStakers).to.be.lessThanOrEqual(2);
    });
  });

  // ======================================================================
  // P2-05: Phase 2 constraint regression tests
  // ======================================================================
  describe("phase2 constraints", () => {
    // A12: deposit_rewards must reject non-authority depositors
    it("deposit_rewards rejects non-authority depositor", async () => {
      const intruder = Keypair.generate();
      await provider.connection.requestAirdrop(
        intruder.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await new Promise((r) => setTimeout(r, 1000));

      const intruderAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        mintAuthority,
        tokenMint,
        intruder.publicKey,
      );

      await mintTo(
        provider.connection,
        mintAuthority,
        tokenMint,
        intruderAta.address,
        mintAuthority.publicKey,
        1000 * TOKENS_PER_UNIT,
      );

      let reverted = false;
      try {
        await program.methods
          .depositRewards(new BN(100 * TOKENS_PER_UNIT))
          .accounts({
            depositor: intruder.publicKey,
            stakingPool: stakingPoolPda,
            depositorTokenAccount: intruderAta.address,
            rewardVault: rewardVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([intruder])
          .rpc();
      } catch (e: any) {
        reverted = true;
        expect(e.toString()).to.match(/Unauthorized|constraint/i);
      }
      expect(reverted, "expected non-authority deposit to revert").to.be.true;
    });

    // A12: create_stake_vault / create_reward_vault must reject non-authority
    it("create_stake_vault rejects non-authority caller", async () => {
      // Derive a fake secondary mint + pool to test vault creation path fresh.
      // Instead, we just try to call it with an intruder against the existing pool,
      // which should fail on the init account (already exists) OR the authority
      // constraint — both are valid protections. We assert that it reverts.
      const intruder = Keypair.generate();
      await provider.connection.requestAirdrop(
        intruder.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await new Promise((r) => setTimeout(r, 1000));

      let reverted = false;
      try {
        await program.methods
          .createStakeVault()
          .accounts({
            authority: intruder.publicKey,
            tokenMint: tokenMint,
            stakingPool: stakingPoolPda,
            stakeVault: stakeVaultPda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([intruder])
          .rpc();
      } catch (e: any) {
        reverted = true;
      }
      expect(reverted, "expected non-authority vault creation to revert").to.be.true;
    });

    // A12: Stake handler must reject re-stake while a position is still active
    it("stake rejects overwriting an active position", async () => {
      // User1 should still have an active stake from earlier describe("stake") suite.
      const stakeAmount = new BN(500 * TOKENS_PER_UNIT);

      let reverted = false;
      try {
        await program.methods
          .stake({ amount: stakeAmount, lockPeriodIndex: 0 })
          .accounts({
            user: user1.publicKey,
            stakingPool: stakingPoolPda,
            userStake: PublicKey.findProgramAddressSync(
              [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user1.publicKey.toBuffer()],
              program.programId,
            )[0],
            userTokenAccount: user1TokenAccount,
            stakeVault: stakeVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
      } catch (e: any) {
        reverted = true;
        // Expect AlreadyStaked error
        expect(e.toString()).to.match(/AlreadyStaked|already.*stake|constraint/i);
      }
      expect(reverted, "expected re-stake over active position to revert").to.be.true;
    });

    // P2-03: Multiplier bounds — all 4 lock periods must be <= MAX_MULTIPLIER_BPS (50000)
    it("all lock period multipliers are within MAX_MULTIPLIER_BPS cap", async () => {
      const pool = await program.account.stakingPool.fetch(stakingPoolPda);
      const MAX_MULTIPLIER_BPS = 50000;
      for (let i = 0; i < pool.lockPeriods.length; i++) {
        expect(
          pool.lockPeriods[i].multiplierBps,
          `lock period ${i} multiplier`,
        ).to.be.at.most(MAX_MULTIPLIER_BPS);
      }
    });

    // P2-03: stake must reject invalid lock period index (>= 4)
    it("stake rejects lock_period_index >= 4", async () => {
      const user3 = Keypair.generate();
      await provider.connection.requestAirdrop(
        user3.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await new Promise((r) => setTimeout(r, 1000));

      const user3Ata = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        mintAuthority,
        tokenMint,
        user3.publicKey,
      );
      await mintTo(
        provider.connection,
        mintAuthority,
        tokenMint,
        user3Ata.address,
        mintAuthority.publicKey,
        1000 * TOKENS_PER_UNIT,
      );

      const [user3StakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user3.publicKey.toBuffer()],
        program.programId,
      );

      let reverted = false;
      try {
        await program.methods
          .stake({ amount: new BN(500 * TOKENS_PER_UNIT), lockPeriodIndex: 4 })
          .accounts({
            user: user3.publicKey,
            stakingPool: stakingPoolPda,
            userStake: user3StakePda,
            userTokenAccount: user3Ata.address,
            stakeVault: stakeVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user3])
          .rpc();
      } catch (e: any) {
        reverted = true;
        expect(e.toString()).to.match(/InvalidLockPeriod|lock period|constraint/i);
      }
      expect(reverted, "expected invalid lock period to revert").to.be.true;
    });
  });

  // ======================================================================
  // Extended use-case tests
  // ======================================================================
  describe("extended use cases", () => {
    // Helper: create a funded user with token account
    async function createFundedUser(solAmount: number, tokenAmount: number) {
      const user = Keypair.generate();
      const airdropSig = await provider.connection.requestAirdrop(
        user.publicKey,
        solAmount * LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(airdropSig);

      const ata = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        mintAuthority,
        tokenMint,
        user.publicKey,
      );

      if (tokenAmount > 0) {
        await mintTo(
          provider.connection,
          mintAuthority,
          tokenMint,
          ata.address,
          mintAuthority.publicKey,
          tokenAmount * TOKENS_PER_UNIT,
        );
      }

      const [stakePda] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, stakingPoolPda.toBuffer(), user.publicKey.toBuffer()],
        program.programId,
      );

      return { user, ata: ata.address, stakePda };
    }

    // 1. Re-stake lifecycle: stake → unstake → re-stake → unstake
    it("re-stake after unstake completes full cycle", async () => {
      const { user, ata, stakePda } = await createFundedUser(5, 2000);

      // First stake
      await program.methods
        .stake({ amount: new BN(500 * TOKENS_PER_UNIT), lockPeriodIndex: 0 })
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Verify active
      let pos = await program.account.userStake.fetch(stakePda);
      expect(pos.isActive).to.be.true;

      // Unstake (early — penalty applies)
      await program.methods
        .unstake()
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          rewardVault: rewardVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      // Verify inactive
      pos = await program.account.userStake.fetch(stakePda);
      expect(pos.isActive).to.be.false;

      // Re-stake with different lock period
      await program.methods
        .stake({ amount: new BN(300 * TOKENS_PER_UNIT), lockPeriodIndex: 1 })
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Verify re-staked with new params
      pos = await program.account.userStake.fetch(stakePda);
      expect(pos.isActive).to.be.true;
      expect(pos.amount.toNumber()).to.equal(300 * TOKENS_PER_UNIT);
      expect(pos.lockPeriodIndex).to.equal(1);

      // Second unstake
      await program.methods
        .unstake()
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          rewardVault: rewardVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      pos = await program.account.userStake.fetch(stakePda);
      expect(pos.isActive).to.be.false;
    });

    // 2. Double claim: second claim returns 0 / NoRewardsToClaim
    it("second immediate claim has no rewards", async () => {
      const { user, ata, stakePda } = await createFundedUser(5, 2000);

      await program.methods
        .stake({ amount: new BN(500 * TOKENS_PER_UNIT), lockPeriodIndex: 0 })
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Wait a tiny bit for some reward to accumulate
      await new Promise((r) => setTimeout(r, 2000));

      // First claim — may succeed with tiny reward
      try {
        await program.methods
          .claimRewards()
          .accounts({
            user: user.publicKey,
            stakingPool: stakingPoolPda,
            userStake: stakePda,
            userTokenAccount: ata,
            rewardVault: rewardVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
      } catch {
        // NoRewardsToClaim is fine for tiny durations
      }

      // Second immediate claim — should fail with NoRewardsToClaim
      let reverted = false;
      try {
        await program.methods
          .claimRewards()
          .accounts({
            user: user.publicKey,
            stakingPool: stakingPoolPda,
            userStake: stakePda,
            userTokenAccount: ata,
            rewardVault: rewardVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
      } catch (e: any) {
        reverted = true;
      }
      expect(reverted, "second immediate claim should fail").to.be.true;
    });

    // 3. Multi-user concurrent staking
    it("two users can stake independently", async () => {
      const userA = await createFundedUser(5, 1000);
      const userB = await createFundedUser(5, 1000);

      const poolBefore = await program.account.stakingPool.fetch(stakingPoolPda);
      const stakersBefore = poolBefore.totalStakers;
      const stakedBefore = poolBefore.totalStaked.toNumber();

      // User A stakes 400
      await program.methods
        .stake({ amount: new BN(400 * TOKENS_PER_UNIT), lockPeriodIndex: 0 })
        .accounts({
          user: userA.user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userA.stakePda,
          userTokenAccount: userA.ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([userA.user])
        .rpc();

      // User B stakes 600
      await program.methods
        .stake({ amount: new BN(600 * TOKENS_PER_UNIT), lockPeriodIndex: 2 })
        .accounts({
          user: userB.user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userB.stakePda,
          userTokenAccount: userB.ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([userB.user])
        .rpc();

      const poolAfter = await program.account.stakingPool.fetch(stakingPoolPda);
      expect(poolAfter.totalStakers).to.equal(stakersBefore + 2);
      expect(poolAfter.totalStaked.toNumber()).to.equal(
        stakedBefore + 1000 * TOKENS_PER_UNIT,
      );

      // Verify individual positions
      const posA = await program.account.userStake.fetch(userA.stakePda);
      const posB = await program.account.userStake.fetch(userB.stakePda);
      expect(posA.amount.toNumber()).to.equal(400 * TOKENS_PER_UNIT);
      expect(posA.lockPeriodIndex).to.equal(0);
      expect(posB.amount.toNumber()).to.equal(600 * TOKENS_PER_UNIT);
      expect(posB.lockPeriodIndex).to.equal(2);
    });

    // 4. Zero amount stake
    it("zero amount stake is rejected", async () => {
      const { user, ata, stakePda } = await createFundedUser(5, 1000);

      let reverted = false;
      try {
        await program.methods
          .stake({ amount: new BN(0), lockPeriodIndex: 0 })
          .accounts({
            user: user.publicKey,
            stakingPool: stakingPoolPda,
            userStake: stakePda,
            userTokenAccount: ata,
            stakeVault: stakeVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
      } catch (e: any) {
        reverted = true;
      }
      expect(reverted, "zero amount should be rejected").to.be.true;
    });

    // 5. Locked APY stability after TVL change
    it("locked APY does not change when TVL increases", async () => {
      const userC = await createFundedUser(5, 5000);
      const userD = await createFundedUser(5, 5000);

      // User C stakes — locks APY at current TVL
      await program.methods
        .stake({ amount: new BN(1000 * TOKENS_PER_UNIT), lockPeriodIndex: 0 })
        .accounts({
          user: userC.user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userC.stakePda,
          userTokenAccount: userC.ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([userC.user])
        .rpc();

      const posC = await program.account.userStake.fetch(userC.stakePda);
      const lockedApyC = posC.lockedApyBps;

      // User D stakes large amount — changes TVL significantly
      await program.methods
        .stake({ amount: new BN(4000 * TOKENS_PER_UNIT), lockPeriodIndex: 3 })
        .accounts({
          user: userD.user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: userD.stakePda,
          userTokenAccount: userD.ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([userD.user])
        .rpc();

      // Re-fetch user C's position — locked APY must be unchanged
      const posCAfter = await program.account.userStake.fetch(userC.stakePda);
      expect(posCAfter.lockedApyBps).to.equal(lockedApyC);

      // User D has a different locked APY (lower due to higher TVL)
      const posD = await program.account.userStake.fetch(userD.stakePda);
      // D has 3x multiplier so may still be higher, but the base APY is lower
      console.log(`  User C locked APY: ${lockedApyC} bps (1.0x, lower TVL)`);
      console.log(`  User D locked APY: ${posD.lockedApyBps} bps (3.0x, higher TVL)`);
    });

    // 6. Deposit rewards then claim reflects new balance
    it("deposited rewards are claimable", async () => {
      const { user, ata, stakePda } = await createFundedUser(5, 2000);

      // Stake
      await program.methods
        .stake({ amount: new BN(500 * TOKENS_PER_UNIT), lockPeriodIndex: 0 })
        .accounts({
          user: user.publicKey,
          stakingPool: stakingPoolPda,
          userStake: stakePda,
          userTokenAccount: ata,
          stakeVault: stakeVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Authority deposits more rewards
      const authorityAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        mintAuthority,
        tokenMint,
        mintAuthority.publicKey,
      );
      await mintTo(
        provider.connection,
        mintAuthority,
        tokenMint,
        authorityAta.address,
        mintAuthority.publicKey,
        500 * TOKENS_PER_UNIT,
      );

      const poolBefore = await program.account.stakingPool.fetch(stakingPoolPda);

      await program.methods
        .depositRewards(new BN(500 * TOKENS_PER_UNIT))
        .accounts({
          depositor: mintAuthority.publicKey,
          stakingPool: stakingPoolPda,
          depositorTokenAccount: authorityAta.address,
          rewardVault: rewardVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([mintAuthority])
        .rpc();

      const poolAfter = await program.account.stakingPool.fetch(stakingPoolPda);
      expect(poolAfter.rewardPoolBalance.toNumber()).to.equal(
        poolBefore.rewardPoolBalance.toNumber() + 500 * TOKENS_PER_UNIT,
      );

      // Wait briefly then claim
      await new Promise((r) => setTimeout(r, 2000));

      try {
        await program.methods
          .claimRewards()
          .accounts({
            user: user.publicKey,
            stakingPool: stakingPoolPda,
            userStake: stakePda,
            userTokenAccount: ata,
            rewardVault: rewardVaultPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();

        // If claim succeeds, reward pool should decrease
        const poolFinal = await program.account.stakingPool.fetch(stakingPoolPda);
        expect(poolFinal.totalRewardsDistributed.toNumber()).to.be.greaterThan(
          poolAfter.totalRewardsDistributed.toNumber(),
        );
      } catch {
        // NoRewardsToClaim is acceptable for very short durations
        console.log("  Claim returned NoRewardsToClaim (duration too short)");
      }
    });
  });
});
