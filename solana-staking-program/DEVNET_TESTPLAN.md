# Phase 2 Devnet Test Plan (P2-06)

> Generated: 2026-04-14
> Scope: Pre-deployment verification that Phase 2 fixes behave correctly on Solana devnet.
> Status: **Test plan only — no devnet execution performed.** Run manually when ready.

This plan covers the on-chain Solana pieces of Phase 2 (Day 6-9). Everything else
(Phase 1 circuits, EVM verifier, Sui verifier) has dedicated unit tests in-tree and
does not require devnet execution.

---

## Prerequisites

- Anchor CLI installed (`anchor --version` ≥ 0.30.1)
- Solana CLI (`solana --version` ≥ 1.18)
- A funded devnet keypair (`solana balance --url devnet` > 5 SOL)
- `solana-staking-program/Anchor.toml` pointing at devnet cluster
- Programs built locally (`anchor build` in `solana-staking-program/`)

## Targets

Two programs participate in Phase 2:

| Program                          | Path                                | Program ID (devnet)                               |
| -------------------------------- | ----------------------------------- | ------------------------------------------------- |
| **zkrune-groth16-verifier**      | `solana-groth16-verifier/`          | `9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad`    |
| **zkrune-staking**               | `solana-staking-program/`           | `44ToPJzWsnqJRhvFS5wXLsgWGWpbe3YwhU9t8LkQBRiX`    |

Verify program IDs match `declare_id!` in each `lib.rs` before deploying.

---

## Step 1 — Deploy the verifier (P2-01)

```
cd solana-groth16-verifier
cargo build-sbf
solana program deploy \
  --url devnet \
  target/deploy/solana_groth16_verifier.so
```

### Checks

1. Deploy succeeds with no panics during module load.
2. Invoke with a valid proof from any Phase 1 circuit (e.g. `hash-preimage`):
   - Expected: transaction succeeds, log contains `"Proof verified successfully!"`.
3. Invoke with **malformed payloads** (P2-01 validation):
   - Payload length 288 (1 byte short of minimum) → must fail with
     `InvalidInstructionData`, no panic.
   - Payload length 290 (one extra byte, `remaining % 32 != 0`) → must fail with
     `InvalidInstructionData`.
   - Payload with `template_id = 99` (unknown) → must fail with `InvalidArgument`.
   - Payload with wrong input count (e.g. 2 inputs for a circuit expecting 3) →
     must fail with `InvalidInstructionData`.

No panics may appear in the transaction logs. A panic manifests as
`"Program failed to complete"` without a structured error code.

---

## Step 2 — Deploy the staking program

```
cd solana-staking-program
anchor build
anchor deploy --provider.cluster devnet
```

### Checks

1. Deploy succeeds; program size is within the BPF limit.
2. `anchor idl init --filepath target/idl/zkrune_staking.json <PROGRAM_ID>`
   publishes the IDL for client SDKs.

---

## Step 3 — Initialize + vault creation (A13)

Use a dedicated "admin" keypair as the pool authority. Do **not** reuse the
deploy keypair for user-facing flows.

```
anchor run initialize-pool --provider.cluster devnet
```

(Or execute the corresponding client script that calls `initialize`,
`create_stake_vault`, `create_reward_vault`.)

### Checks

1. `initialize` succeeds and emits `"Staking pool initialized with dynamic APY"`.
2. Pool state:
   - `authority` equals the admin keypair pubkey.
   - `lock_periods` has exactly 4 entries with multipliers 10000/15000/20000/30000.
   - `yearly_emission`, `max_apy_bps`, `min_apy_bps` match the init params.
3. `create_stake_vault` from the **admin** keypair succeeds.
4. **Attacker path:** `create_stake_vault` from any other keypair must fail with
   `Unauthorized` (A13). Try it with a fresh devnet wallet.
5. Same two checks for `create_reward_vault`.

---

## Step 4 — Stake + re-stake lifecycle (A12, P2-03)

Run with **user1** (a fresh keypair with freshly minted test tokens).

### 4a. Happy path

1. `stake({ amount: 500 * 1e6, lockPeriodIndex: 0 })` (30-day lock, 1.0x).
2. Verify `user_stake` account:
   - `is_active = true`
   - `locked_apy_bps = calculate_dynamic_apy() * 10000 / 10000` (i.e. base APY,
     since multiplier is 1.0x at index 0).
   - `unlock_at = staked_at + 30 * 86400`.
3. Pool state: `total_staked` increased by 500e6, `total_stakers = 1`.

### 4b. Re-stake rejection (A12)

4. Immediately try `stake` again with the same user1 keypair.
   - Expected: fails with `AlreadyStaked` error code.
   - This confirms `init_if_needed` does **not** silently overwrite the active
     position (lib.rs:499-503 guard).

### 4c. Invalid lock period (P2-03)

5. From a new user, `stake({ lockPeriodIndex: 4 })`.
   - Expected: fails with `InvalidLockPeriod`.
6. `stake({ lockPeriodIndex: 255 })` → same failure.

### 4d. Below-minimum stake

7. `stake({ amount: 1 })` → `BelowMinimumStake`.

---

## Step 5 — deposit_rewards authority (P2-02)

### 5a. Admin path

1. From the admin keypair: `deposit_rewards(1000 * 1e6)`.
   - Reward vault balance increases by 1000e6.
   - `pool.reward_pool_balance` updated atomically.

### 5b. Intruder path

2. From any other keypair: `deposit_rewards(100 * 1e6)`.
   - Expected: fails with `Unauthorized` (P2-02 constraint on `DepositRewards`
     struct).
   - This confirms that a malicious actor cannot inflate `reward_pool_balance`
     with their own tokens to manipulate APY clamping or reward accounting.

---

## Step 6 — Unstake + re-stake (A12 happy path)

With user1 from Step 4:

1. `unstake()` while still locked:
   - Applies 50% early-withdrawal penalty.
   - `user_stake.is_active = false`.
   - Pool: `total_staked` decreases by full amount, penalty transferred to
     reward vault (recycling).
2. Immediately after unstake, `stake({ amount: 300 * 1e6, lockPeriodIndex: 1 })`.
   - Expected: **succeeds** (A12 — re-stake allowed after `is_active = false`).
   - `init_if_needed` reuses the same PDA; handler overwrites fresh state.
3. Verify the new position: fresh `staked_at`, `unlock_at`, `locked_apy_bps`
   reflecting lock period 1 (1.5x multiplier).

---

## Step 7 — Claim rewards

1. Wait ~30 seconds after a stake to accumulate rewards.
2. `claim_rewards()`:
   - Transfers `calculate_pending_rewards(now)` from reward vault to user.
   - `user_stake.last_claim_at = now`.
   - `pool.reward_pool_balance` decreases.
   - `pool.total_rewards_distributed` increases.
3. Call again immediately — expect `NoRewardsToClaim`.

---

## Step 8 — Multiplier + overflow edge cases (P2-03)

These are harder to exercise on devnet without a custom test harness, but
the **Rust unit tests** (`cargo test --lib` in the staking program) cover:

- `dynamic_apy_clamps_to_max` — raw APY > max_apy_bps → capped.
- `dynamic_apy_clamps_to_min` — raw APY < min_apy_bps → floored.
- `dynamic_apy_empty_pool_returns_max`
- `dynamic_apy_overflow_returns_max` — `yearly_emission * 10000` path.
- `default_multipliers_below_cap` — ensures the hardcoded 4 multipliers are all
  ≤ `MAX_MULTIPLIER_BPS` (50000).

If a future admin adds a lock period with `multiplier_bps > 50000`, the
`initialize` defensive loop will reject it (line 463-468 in `lib.rs`). There is
currently no `update_lock_periods` instruction, so this is purely forward-looking.

---

## Rollback plan

If any Step 3-7 check fails on devnet:

1. Do **not** touch mainnet.
2. Capture the failing transaction signature and full program logs.
3. File an issue in `zkrune/security` with the commit hash of the deployed
   program (`solana program show <PROGRAM_ID> --url devnet` → hash of on-chain
   ELF).
4. Redeploy the previous working build via `solana program deploy --buffer ...`.

Phase 2 devnet deployments are reversible because staking positions are always
user-owned PDAs — any user can `unstake` their own position after a rollback.

---

## What's covered by unit tests (no devnet needed)

These Phase 2 checks already run via `cargo test --lib`:

### `solana-groth16-verifier`
- `layout_accepts_minimum_valid_size`
- `layout_rejects_too_short`
- `layout_rejects_non_multiple_of_32`
- `layout_rejects_zero_remaining`
- `layout_rejects_wrong_input_count`
- `layout_accepts_multiple_inputs`
- `all_template_ids_have_vk` (VK integrity)
- `unknown_template_id_returns_none`
- `template_names_match_vk_count`

### `solana-staking-program`
- `dynamic_apy_clamps_to_max`
- `dynamic_apy_clamps_to_min`
- `dynamic_apy_empty_pool_returns_max`
- `dynamic_apy_overflow_returns_max`
- `max_multiplier_is_5x`
- `default_multipliers_below_cap`
- `reward_calculation_with_locked_apy`
- `inactive_stake_returns_zero_rewards`

### `evm-verifier`
- 18 Hardhat tests, including 6 new curve-validation cases.

### `sui-groth16-verifier`
- 3 Move tests.

### Anchor integration (runs under `anchor test` when a local validator is up)
- `deposit_rewards rejects non-authority depositor`
- `create_stake_vault rejects non-authority caller`
- `stake rejects overwriting an active position`
- `all lock period multipliers are within MAX_MULTIPLIER_BPS cap`
- `stake rejects lock_period_index >= 4`
