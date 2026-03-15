# zkrune-sdk

Zero-knowledge proof SDK for Solana. Generate and verify Groth16 zk-SNARK proofs entirely client-side.

## Install

```bash
npm install zkrune-sdk
```

## Quick Start

```typescript
import { ZkRune, templates } from 'zkrune-sdk';

const zk = new ZkRune();

const result = await zk.prove('age-verification', {
  birthYear: '1990',
  currentYear: '2026',
  minimumAge: '18',
});

if (result.success) {
  console.log('Proof valid:', result.proof.isValid);
  console.log('Generated in:', result.timing, 'ms');
}
```

## Verify Against Hosted Verifier

```typescript
const { isValid } = await zk.verifyRemote({
  circuitName: 'age-verification',
  proof: result.proof.groth16Proof,
  publicSignals: result.proof.publicSignals,
});
```

## Standalone Functions

For backward compatibility, standalone functions are also available:

```typescript
import { generateProof, verifyProof, verifyProofRemote } from 'zkrune-sdk';
```

## Configuration

```typescript
const zk = new ZkRune({
  circuitBaseUrl: 'https://zkrune.com/circuits', // default
  verifierUrl: 'https://zkrune.com/api/verify-proof', // default
  debug: false, // set true for console output
  timeout: 30_000, // remote verify timeout (ms)
  cache: true, // cache circuit files in memory
});
```

## Progress Tracking

```typescript
const result = await zk.prove('balance-proof', inputs, {
  onProgress: (stage) => {
    // stage: 'loading-circuit' | 'generating-proof' | 'verifying' | 'complete'
    updateUI(stage);
  },
});
```

## Preload Circuits

```typescript
// Preload circuit files for faster first proof
await zk.preload('age-verification');
```

## Available Templates

### Identity & Access
| Template | ID | Inputs |
|----------|----|--------|
| Age Verification | `age-verification` | birthYear, currentYear, minimumAge |
| Membership Proof | `membership-proof` | memberId, groupHash |
| Credential Proof | `credential-proof` | credentialHash, credentialSecret, validUntil, currentTime, expectedHash |

### Financial
| Template | ID | Inputs |
|----------|----|--------|
| Balance Proof | `balance-proof` | balance, minimumBalance |
| Token Swap | `token-swap` | tokenABalance, swapSecret, requiredTokenA, swapRate, minReceive |
| Range Proof | `range-proof` | value, minRange, maxRange |

### Governance
| Template | ID | Inputs |
|----------|----|--------|
| Private Voting | `private-voting` | voterId, voteChoice, pollId |
| Quadratic Voting | `quadratic-voting` | voterId, tokenBalance, voteChoice, pollId, minTokens |

### Cryptographic
| Template | ID | Inputs |
|----------|----|--------|
| Hash Preimage | `hash-preimage` | preimage, salt, expectedHash |
| Signature Verification | `signature-verification` | R8x, R8y, S, Ax, Ay, M |
| Patience Proof | `patience-proof` | startTime, endTime, secret, minimumWaitTime, commitmentHash |
| NFT Ownership | `nft-ownership` | nftTokenId, ownerSecret, collectionRoot, minTokenId, maxTokenId |
| Anonymous Reputation | `anonymous-reputation` | userId, reputationScore, userNonce, thresholdScore, platformId |

## Input Validation

All inputs are validated at runtime against circuit schemas before proof generation. Invalid inputs return a descriptive error:

```typescript
const result = await zk.prove('age-verification', {
  birthYear: '1990',
  // missing currentYear and minimumAge
});
// result.success === false
// result.error === 'Invalid inputs: missing required field "currentYear", missing required field "minimumAge"'
```

## Self-Hosting

Point the SDK to your own circuit files and verifier:

```typescript
const zk = new ZkRune({
  circuitBaseUrl: 'https://your-domain.com/circuits',
  verifierUrl: 'https://your-domain.com/api/verify-proof',
});
```

## Links

- [zkrune.com](https://zkrune.com)
- [Integration Guide](https://zkrune.com/docs)
- [GitHub](https://github.com/louisstein94/zkrune)
- [@rune_zk](https://x.com/rune_zk)

## License

MIT
