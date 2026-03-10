# @zkrune/kage-plugin

> ZK Viewing Key Verification for the [Kage Shadow Memory Protocol](https://kage.onl)

Kage currently shares viewing keys directly between parties. This plugin replaces that with a **Groth16 zero-knowledge proof** — callers prove they *know* the viewing key without ever transmitting it.

## How It Works

```
Memory creation (once):
  hash = Poseidon(viewingKey, salt)   ← stored on Solana PDA
  viewingKey + salt                   ← stored only in user's local vault

Access request (every time):
  ZK proof: "I know preimage of hash" ← proof sent, key never sent
  Nullifier: Poseidon(key, salt+1)    ← stored on-chain to block replays
```

The viewing key **never leaves the device**. The on-chain hash and nullifier are the only public values.

## Installation

```bash
npm install @zkrune/kage-plugin snarkjs
```

## Usage

### 1. Creating a Memory (Kage SDK side)

```ts
import { hashViewingKey } from '@zkrune/kage-plugin';

const viewingKey = generateRandomBigInt(); // store in local vault
const salt = generateRandomBigInt();       // store in local vault

// Store this hash on the Solana PDA — not the key itself
const onChainHash = await hashViewingKey(viewingKey, salt);
await kage.storeMemory({ data, onChainHash });
```

### 2. Proving Access (user / agent side)

```ts
import { proveViewingKeyAccess } from '@zkrune/kage-plugin';

// viewingKey and salt come from the user's local vault
// onChainHash is fetched from the Solana PDA
const result = await proveViewingKeyAccess({
  viewingKey,
  salt,
  viewingKeyHash: onChainHash,
});

if (result.success) {
  // Send proof to Kage — viewing key never included
  await kage.requestAccess({ proof: result.data });
}
```

### 3. Verifying Access (Kage SDK / server side)

```ts
import { verifyViewingKeyProof } from '@zkrune/kage-plugin';

const usedNullifiers = new Set<string>(); // persist this in your DB

const { valid, reason } = await verifyViewingKeyProof(
  incomingProof,
  onChainHash,   // fetched from Solana PDA
  usedNullifiers,
);

if (valid) {
  // Grant access to the encrypted memory
}
```

## Circuit

The underlying Circom circuit (`circuits/viewing-key-proof/circuit.circom`) uses:

- **Poseidon hash** (ZK-friendly, circomlib) for computing and verifying the key hash
- **Nullifier derivation** to prevent replay attacks without revealing the key
- **Groth16** proof system — ~200 byte proof, <2ms verification on Solana

| Signal | Visibility | Description |
|---|---|---|
| `viewingKey` | Private | The actual viewing key |
| `salt` | Private | Random salt from vault |
| `viewingKeyHash` | Public | Poseidon hash on Solana PDA |
| `isAuthorized` | Public output | 1 if key is valid |
| `nullifier` | Public output | Replay-prevention token |

## Security Properties

- **Zero knowledge**: Verifier learns nothing about `viewingKey` beyond that it hashes correctly
- **Soundness**: Forging a proof without the key is computationally infeasible (Groth16 / BN254)
- **Replay protection**: Each (key, salt) pair produces a unique nullifier; Kage stores used nullifiers
- **Trusted setup**: Inherits zkRune's MPC ceremony (January 2026, 54 participants)
