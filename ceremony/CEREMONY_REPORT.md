# zkRune Trusted Setup Ceremony Report

## Overview

| Property | Value |
|----------|-------|
| Project | zkRune - Solana Privacy Hack 2026 |
| Ceremony Type | Groth16 Multi-Party Computation |
| Phase 1 | Hermez Network Powers of Tau (54 participants) |
| Phase 2 | zkRune Community Ceremony |
| Started | 2026-01-14T00:00:00Z |
| Finalized | 2026-01-15T12:04:03Z |
| Total Contributions | 5 |
| Beacon Source | drand.cloudflare.com |
| Beacon Value | `6ca3952b1a006bea69b40bac4c78a862ca475e90e1edb570d9610cbe18d0a8bc` |

## Circuits (13 Total)

| Circuit | Description |
|---------|-------------|
| age-verification | Prove age without revealing birthdate |
| anonymous-reputation | Prove reputation score anonymously |
| balance-proof | Prove token balance without revealing exact amount |
| credential-proof | Prove credential ownership |
| hash-preimage | Prove knowledge of hash preimage |
| membership-proof | Prove membership in a group |
| nft-ownership | Prove NFT ownership privately |
| patience-proof | Prove time-locked token holding |
| private-voting | Cast votes anonymously |
| quadratic-voting | Quadratic voting with privacy |
| range-proof | Prove value is within range |
| signature-verification | Verify signatures in ZK |
| token-swap | Private token swaps |

## Contributors

| # | Name | Timestamp | Hash |
|---|------|-----------|------|
| 1 | zkRune Genesis | 2026-01-15T09:44:33 | storage_age-veri... |
| 2 | MikeJ | 2026-01-15T09:44:33 | storage_age-veri... |
| 3 | iCrypto | 2026-01-15T10:41:24 | e927ad72bb1a2e1a... |
| 4 | 0xMert | 2026-01-15T11:50:26 | f50e4e08d4e3dfd8... |
| 5 | LizardKing | 2026-01-15T11:54:45 | bdc24921379bcfba... |

## Final Contribution Hashes

| Circuit | Final Hash |
|---------|------------|
| age-verification | f4866299b236453690bab012eeeb3a5439c3f1f24fab742e3064e125b6025641... |
| anonymous-reputation | 420c352e1c06fce9fb1107f6f59e26715c0800068b33ed77cd1a499222192acb... |
| balance-proof | 7a0f15a3df34eb48dfce51ed3ea44708fb26a8d7b8cfd1e18186b7ff357ecb0f... |
| credential-proof | 9f297a361367624e273ec4c70714bf534c6429a7be4faa42204146dd9b28b9b2... |
| hash-preimage | 64d394d5bbed98be8577227236a35544fda64817a6bc3b18190eed42e578af15... |
| membership-proof | cc803cdc2d6b60b8051e60c93dfaf93d61965aa48c7b0431b9bf4d1833c99d75... |
| nft-ownership | cefdb1403b60357cb302850ff0a712cd6564e86fad00aa4baec2f5fc1c887c9a... |
| patience-proof | eb72671d4a429a11225f0d064c4f9475bafb3f2b2a5e0391c3c364e1bfe05c7a... |
| private-voting | 5133f2ffb8d4149d13b4db58c78722db3d13766d25bb64f3afdbc1815a3ee911... |
| quadratic-voting | 192b76324c36e93e790c11eb9295f73a704c57a5d96f9d04bf562b61f5d6f4c5... |
| range-proof | 4c68878ade49bb496ad4af04733e4b1477cae45343346a8825810510ae1baf51... |
| signature-verification | 35a6d38dfbe902f115271f339f8ca41fe6bdd6e3aae5cc28f7dc5d764a6cda7a... |
| token-swap | de255ef5f48b3c1deace6a58cac00ae6ee040949158c94c2230e728d399524ba... |

## Security Guarantees

The Groth16 trusted setup is secure as long as **at least one participant** was honest and properly deleted their toxic waste (random values used during contribution).

Each contributor added entropy that cannot be reversed. The final ceremony includes:

1. **Phase 1**: Hermez Network's Powers of Tau ceremony with 54 participants
2. **Phase 2**: zkRune community contributions (5 contributors)
3. **Final Beacon**: Random value from drand network (`6ca3952b1a006bea69b40bac4c78a862ca475e90e1edb570d9610cbe18d0a8bc`)

## Verification

Anyone can verify the ceremony by running:

```bash
# Clone the repository
git clone https://github.com/louisstein94/zkrune.git
cd zkrune

# Verify each circuit's final zkey
for circuit in circuits/*/; do
  circuit_name=$(basename $circuit)
  snarkjs zkey verify \
    "$circuit/circuit.r1cs" \
    "ceremony/powersOfTau28_hez_final_14.ptau" \
    "$circuit/circuit_final.zkey"
done
```

## Files

- **Final zkeys**: `circuits/*/circuit_final.zkey`
- **Verification keys**: `circuits/*/verification_key.json`
- **Public files**: `public/circuits/`
- **Beacon value**: `ceremony/beacon.txt`

## Acknowledgments

Thank you to all contributors who participated in the trusted setup ceremony:

- zkRune Genesis (Initial setup)
- MikeJ
- iCrypto
- 0xMert
- LizardKing

Your contributions ensure the security and trustlessness of zkRune's privacy features on Solana.

---

*Generated on 2026-01-15T12:04:03Z*
*https://github.com/louisstein94/zkrune*
