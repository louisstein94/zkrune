# Private offering eligibility

A regulated offering that verifies an investor is eligible without learning
who they are, where they live, or how accredited they actually are.

```bash
npx tsx issue-and-prove.ts
```

## What it shows

Three parties, and what each one is deliberately prevented from knowing.

**The issuer** — a transfer agent, fund administrator or KYC provider — signs
a claim about an investor and publishes only its public key. It never receives
the investor's secret, so it cannot produce proofs on their behalf, and a
breach of its records yields no usable credentials.

**The venue** publishes the countries it serves and the tier it requires, then
verifies proofs against the issuer's public key. It configures that key once;
every credential the issuer ever signs verifies against it, with no per-investor
commitment to publish and no root to refresh.

**The investor** generates their own secret, receives a signed credential, and
proves eligibility. A qualified purchaser entering an accredited-investor
offering proves `tier >= ACCREDITED` without disclosing that they clear the
higher bar.

## What the venue learns

That an eligible investor arrived, and a nullifier. Nothing else.

The nullifier is deterministic per investor per offering, so the gate can
enforce one entry each and detect reuse — while the same investor stays
unlinkable across offerings. The example demonstrates this: a second attempt
in a fresh session reproduces the same nullifier, so the gate turns it away
without ever learning who was turned away.

## Session binding

Each proof is bound to a `sessionNonce` the verifier issues. A proof captured
in flight cannot be replayed into another session or presented to a different
verifier.

## Revocation

Credentials in this example are issued with a 30-day window, and that is
deliberate. The circuit proves an issuer signed a claim; it has no way to learn
that the issuer later changed its mind. Until a revocation mechanism ships, a
short validity window is the revocation story — a credential that stops being
true stops being usable within days rather than years.

For offerings where that is not tight enough, issue for hours and re-issue on
demand. The signing operation is cheap; it is the accreditation review behind
it that is expensive, and that does not have to repeat.
