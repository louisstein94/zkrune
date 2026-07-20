# zkRune Trusted Setup Ceremony Report

> **Current status (corrected 2026-06-12).** A January 2026 multi-party Phase 2
> ceremony was run. **However, the zkeys currently shipping in production were
> regenerated *after* that ceremony (March–April 2026) and are NOT the ceremony
> outputs.** As of this audit, **none of the 14 production circuits ship a
> multi-party-backed zkey**: 1 can be restored to the January setup, 12 require a
> fresh re-ceremony, and 1 was never part of any ceremony. Until a fresh Phase 2
> is completed, treat the affected setups as **single-party** (the toxic waste may
> be known to whoever generated them). See [Remediation](#remediation).

## Per-circuit status (audit 2026-06-12)

Method: `snarkjs zkey verify <current r1cs> <ptau> <January ceremony/zkeys/*_final.zkey>`.
A January multi-party zkey only verifies if the circuit is unchanged since the ceremony.

| Circuit | January zkey valid vs current circuit? | Production zkey today | Status |
|---|---|---|---|
| private-voting | ✅ valid (circuit unchanged since Nov 2025) | single-party (regenerated Apr) | **Restorable** — re-ship the Jan multi-party zkey, no new ceremony |
| age-verification | ❌ (circuit changed Mar) | single-party | Needs re-ceremony |
| balance-proof | ❌ (circuit changed Mar) | single-party | Needs re-ceremony |
| range-proof | ❌ (circuit changed Mar) | single-party | Needs re-ceremony |
| signature-verification | ❌ (circuit changed Mar) | single-party | Needs re-ceremony |
| token-swap | ❌ (circuit changed Mar) | single-party | Needs re-ceremony |
| membership-proof | ❌ (circuit changed Mar 18) | single-party | Needs re-ceremony |
| hash-preimage | ❌ (circuit changed Apr 13) | single-party | Needs re-ceremony |
| quadratic-voting | ❌ (circuit changed Apr 13) | single-party | Needs re-ceremony |
| anonymous-reputation | ❌ (circuit changed Apr 16) | single-party | Needs re-ceremony |
| credential-proof | ❌ (circuit changed Apr 16) | single-party | Needs re-ceremony |
| nft-ownership | ❌ (circuit changed Apr 16) | single-party | Needs re-ceremony |
| patience-proof | ❌ (circuit changed Apr 16) | single-party | Needs re-ceremony |
| whale-holder | — (no January zkey) | single-party | **Never ceremonied** |

**Summary: 1 restorable · 12 need re-ceremony · 1 never ceremonied → 13 of 14 require a fresh multi-party Phase 2.** Only the Phase 1 Powers of Tau is reusable.

## What happened

1. **Jan 14–15 2026 — original ceremony.** A Phase 2 multi-party ceremony was run
   and finalized (beacon below). Its outputs are preserved in `ceremony/zkeys/`.
2. **Circuits were later changed for correctness** (constraint fixes, boolean-output
   enforcement, Merkle membership) across several commits — `60626ca` (Mar, 5
   circuits), `95c8bb0` (Mar 18, membership), `33607cb` / `d9b9ce2` (Apr 13),
   `9cef875` (Apr 16, 6 circuits). Changing a circuit invalidates its prior Phase 2.
3. **The regenerated zkeys that shipped to production were not produced by a new
   multi-party ceremony** — no Phase 2 contributions were recorded after Jan 14
   (`ceremony/contributions/` holds a single record). They are therefore
   effectively single-party setups.

## Original January 2026 ceremony (historical)

| Property | Value |
|----------|-------|
| Phase 1 | Hermez Network Powers of Tau (54 participants) — still valid & reused |
| Phase 2 | zkRune community ceremony, finalized 2026-01-15T12:04:03Z |
| Reported contributors | 5 (zkRune Core/Genesis, MikeJ, iCrypto, 0xMert, LizardKing) |
| Contribution records in repo | 1 (`contributions/contribution_1_zkRune_Core.json`, 2026-01-14) |
| Beacon Source | drand.cloudflare.com |
| Beacon Value | `6ca3952b1a006bea69b40bac4c78a862ca475e90e1edb570d9610cbe18d0a8bc` |

> Note: the contributor table reflects the January ceremony as reported; the
> repository retains one contribution record. Regardless of the January count,
> the production zkeys today are post-ceremony regenerations (see above).

## Security implications

A Groth16 Phase 2 is secure only if **at least one contributor was honest,
independent, and deleted their toxic waste**. A single-party setup provides no
such guarantee: whoever generated the zkey could, in principle, hold the toxic
waste and forge proofs that pass verification. This affects every production
circuit except a restored `private-voting`. Tools that rely on these circuits
(hosted verifier, x402 gate, on-chain verifiers, the agent passport's
`signature-verification`) inherit this status until remediated.

## Remediation

1. **Restore `private-voting`** to its January multi-party zkey (1 circuit, no new
   ceremony). Re-ship the vkey across `public/circuits/` and the on-chain verifiers.
2. **Run a fresh multi-party Phase 2** for the remaining 13 circuits, reusing the
   Phase 1 ptau. Independence is what provides security — this requires **2–3
   genuinely independent contributors** on their own machines (multiple agents
   under one operator do **not** count). `scripts/ceremony.sh` automates the flow;
   finalize with a public drand beacon.
3. **Retire `whale-holder` v1** (Sybil-vulnerable) and ceremony v2 instead.
4. **Propagate** new vkeys to `public/circuits/`, `solana-groth16-verifier`,
   `evm-verifier`, and the Sui verifier.

## Verify it yourself

```bash
git clone https://github.com/louisstein94/zkrune.git && cd zkrune
# Verify the CURRENT production zkeys against the multi-party chain.
# This will FAIL for the regenerated circuits — that failure is the point.
for circuit in circuits/*/; do
  name=$(basename "$circuit")
  snarkjs zkey verify "$circuit/circuit.r1cs" \
    "ceremony/powersOfTau28_hez_final_14.ptau" \
    "ceremony/zkeys/${name}_final.zkey"
done
```

---

*Original ceremony: 2026-01-15. Status corrected after audit: 2026-06-12.*
*https://github.com/louisstein94/zkrune*
