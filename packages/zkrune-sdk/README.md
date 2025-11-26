# zkrune-sdk

JavaScript SDK for zkRune - Generate zero-knowledge proofs in your app.

## Installation

```bash
npm install zkrune-sdk
# or
yarn add zkrune-sdk
```

## Quick Start

```typescript
import { generateProof, templates } from 'zkrune-sdk';

// Generate an age verification proof
const result = await generateProof({
  templateId: templates.AGE_VERIFICATION,
  inputs: {
    birthYear: '1995',
    currentYear: '2024',
    minimumAge: '18'
  }
});

if (result.success) {
  console.log('Proof generated!', result.proof);
  console.log('Time taken:', result.timing, 'ms');
}
```

## Features

- **Browser & Node.js compatible**
- **Real Groth16 zk-SNARKs**
- **13 ready-to-use templates**
- **Client-side proof generation**
- **TypeScript support**
- **Zero dependencies** (except snarkjs)
- **Zcash-powered privacy**

## Available Templates

### Identity & Access
- `age-verification` - Prove age without revealing exact date
- `credential-proof` - Prove valid credentials without revealing data
- `membership-proof` - Prove membership without identity

### Financial
- `balance-proof` - Prove minimum balance without amount
- `token-swap` - Prove sufficient balance for swap anonymously
- `range-proof` - Prove value in range without exact number

### Governance
- `private-voting` - Vote anonymously with proof
- `quadratic-voting` - Fair governance voting with quadratic weighting

### Cryptography & Advanced
- `hash-preimage` - Prove you know secret X where hash(X) = Y
- `signature-verification` - Verify signatures without revealing private key
- `patience-proof` - Prove you waited a time period
- `nft-ownership` - Prove NFT ownership without revealing which NFT
- `anonymous-reputation` - Prove reputation score exceeds threshold

## API Reference

### `generateProof(options)`

Generates a zero-knowledge proof.

**Parameters:**
- `templateId` (string) - Template identifier
- `inputs` (object) - Input values for the circuit
- `circuitPath` (string, optional) - Custom circuit path

**Returns:** `Promise<ZKProofResult>`

### `verifyProof(params)`

Verifies a zero-knowledge proof.

**Parameters:**
- `proof` - The Groth16 proof object
- `publicSignals` - Public signals array
- `verificationKey` - Verification key object

**Returns:** `Promise<boolean>`

## Examples

### Balance Proof

```typescript
import { generateProof, templates } from 'zkrune-sdk';

const proof = await generateProof({
  templateId: templates.BALANCE_PROOF,
  inputs: {
    balance: '10000',
    minimumBalance: '5000'
  }
});
```

### Membership Proof

```typescript
const proof = await generateProof({
  templateId: templates.MEMBERSHIP_PROOF,
  inputs: {
    memberId: '123456',
    groupHash: '999'
  }
});
```

### NFT Ownership Proof

```typescript
const proof = await generateProof({
  templateId: templates.NFT_OWNERSHIP,
  inputs: {
    nftId: '42',
    collectionId: '100'
  }
});
```

### Quadratic Voting

```typescript
const proof = await generateProof({
  templateId: templates.QUADRATIC_VOTING,
  inputs: {
    voteCount: '5',
    credits: '25'
  }
});
```

## Links

- **Website:** [zkrune.com](https://zkrune.com)
- **GitHub:** [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- **Twitter:** [@rune_zk](https://x.com/rune_zk)

## License

MIT

