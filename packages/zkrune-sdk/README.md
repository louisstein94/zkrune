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
- **5 ready-to-use templates**
- **Client-side proof generation**
- **TypeScript support**
- **Zero dependencies** (except snarkjs)

## Available Templates

- `age-verification` - Prove age without revealing exact date
- `balance-proof` - Prove minimum balance without amount
- `membership-proof` - Prove membership without identity
- `range-proof` - Prove value in range without exact number
- `private-voting` - Vote anonymously with proof

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
const proof = await generateProof({
  templateId: 'balance-proof',
  inputs: {
    balance: '10000',
    minimumBalance: '5000'
  }
});
```

### Membership Proof

```typescript
const proof = await generateProof({
  templateId: 'membership-proof',
  inputs: {
    memberId: '123456',
    groupHash: '999'
  }
});
```

## Links

- **Website:** [zkrune.com](https://zkrune.com)
- **GitHub:** [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- **Twitter:** [@rune_zk](https://x.com/rune_zk)

## License

MIT

