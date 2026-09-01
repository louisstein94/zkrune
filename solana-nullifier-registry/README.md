# Admission registry

Records one admission per investor per offering, in compressed state.

## Why it exists

The eligibility circuit publishes a nullifier that identifies an investor
within one offering and nowhere else. A venue can use that to recognise a
repeat attempt — but recognising is not refusing, and a venue holding the set
in its own database is trusted twice over: to check honestly at the door, and
to report honestly afterwards.

This moves the check somewhere nobody has to be trusted for it.

## How the rule is enforced

Each admission derives a compressed account address from the offering and the
nullifier. An address in a Light address tree can only be created once, so a
second admission for the same investor fails in the address tree rather than
in the venue's code. The chain enforces the rule, and anyone can read back
what was actually enforced.

## Why compressed state

The registry grows with subscribers. A regular Solana account per nullifier
carries rent an offering with real numbers would feel. Compressed accounts
commit to a Merkle tree with only the root on chain, which is the difference
between a registry that scales with an offering and one that taxes it.

## What is public

The offering, the nullifier and a timestamp. A nullifier is unlinkable to the
same investor in any other offering, so a public registry discloses that
someone was admitted and nothing about who.

## Status

The address derivation and the record layout are implemented and tested. The
CPI that writes the account into the address tree is not yet wired, so the
program does not create compressed state — `admit` validates its arguments and
returns. Deploying it as-is records nothing.

## Build

```bash
cargo test --lib     # address derivation
cargo build-sbf      # program binary
```
