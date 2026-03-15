# zkRune Trust Model

This document classifies every verification flow by the trust level of its inputs. Integrators should use this to understand what each proof actually guarantees.

## Classification

| Level | Meaning |
|-------|---------|
| **Production** | Proof inputs come from a verifiable source or the proof is self-contained (cryptographic primitive). Safe to rely on for access decisions. |
| **Self-Asserted** | The user supplies the private input (e.g. birthdate). The proof is mathematically valid, but the underlying claim is only as trustworthy as the user's honesty. Suitable for soft gates and UX friction, not for high-stakes compliance. |
| **Experimental** | The data source has a demo fallback or the circuit logic is simplified. Do not use for production access decisions without additional validation. |

## Circuit Classification

### Production

| Circuit | Input Source | What the Proof Guarantees |
|---------|-------------|---------------------------|
| Hash Preimage | User-supplied secret | User knows x such that hash(x) = y. Cryptographically sound. |
| Signature Verification | User-supplied signature | User holds a valid signature for a message. Cryptographically sound. |
| Patience Proof | User-supplied timestamp | User waited at least N seconds. Verifiable against block time. |
| Private Voting | User-supplied vote + nullifier | Vote is valid and has not been cast before. Nullifier prevents double-voting. |

### Self-Asserted (production-safe with disclosed trust boundary)

| Circuit | Input Source | What the Proof Guarantees | Trust Boundary |
|---------|-------------|---------------------------|----------------|
| Age Verification | User types birthdate | User claims to be 18+. Proof is valid but birthdate is not attested by an issuer. | No external attestation. Equivalent to a checkbox "I am 18+" with cryptographic binding. |
| Balance Proof | User types balance amount | User claims balance >= threshold. Proof is valid but the balance value is self-reported. | In production, combine with on-chain balance lookup or signed oracle feed. |
| Membership Proof | User types group secret/hash | User claims membership in a group. Proof is valid but group registry is local. | In production, the membership Merkle root should come from a trusted registry or on-chain state. |
| Range Proof | User types value | Value is within [min, max]. Self-reported. | Combine with attested data source for real eligibility. |
| Credential Verification | User types credential data | User claims valid credential. Self-reported. | Requires external issuer attestation for production trust. |
| Anonymous Reputation | User types reputation score | Score >= threshold. Self-reported. | Requires on-chain or oracle-backed reputation feed. |
| NFT Ownership | User types NFT metadata | User claims ownership. Self-reported. | Combine with on-chain ownership check (Metaplex, etc.). |
| Quadratic Voting | User types token balance | Vote weight derived from self-reported balance. | Combine with on-chain token balance for real governance. |
| Token Swap | User types position data | Swap eligibility. Self-reported. | Combine with on-chain balance verification. |

### Experimental

| Feature | Reason | Path to Production |
|---------|--------|--------------------|
| Zcash transparent balance API (`/api/zcash-balance`) | Falls back to demo data (hardcoded 5.12 ZEC) when external APIs are unavailable. | Remove demo fallback; fail explicitly when APIs are down. |
| Zcash shielded balance API (`/api/zcash-balance-shielded`) | Viewing key decryption not implemented; returns demo balance. | Implement Zcash Rust SDK WASM for real note decryption. |
| Zcash Lightwalletd balance (`/api/zcash-balance-lightwalletd`) | gRPC connection may fail silently; falls back to demo. | Require explicit connection health check; no silent fallback. |

## Guidelines for Integrators

1. **For access gates**: Use `Production` circuits or `Self-Asserted` circuits where the trust boundary is acceptable for your use case.
2. **For compliance**: Do not rely on `Self-Asserted` inputs without external attestation. The proof guarantees math, not the truthfulness of the input.
3. **For prototyping**: `Experimental` features are fine for demos and development. Do not use them in user-facing production flows.
4. **Disclose trust level**: When embedding zkRune verification, tell your users what the proof actually proves and what it does not.

## Upgrading Trust Level

Self-Asserted circuits can be upgraded to Production by:
- Connecting the input to an on-chain data source (e.g. Solana token balance for Balance Proof)
- Integrating an issuer/attestation layer (e.g. signed credential for Age Verification)
- Using a trusted Merkle root from on-chain state (e.g. group registry for Membership Proof)

These upgrades are planned for future releases. See the roadmap for timelines.
