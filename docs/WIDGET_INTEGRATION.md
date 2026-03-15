# Prove with zkRune — Integration Guide

Add privacy-preserving verification to your app. Users prove claims (age, membership, balance) without exposing raw data.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Your App                                               │
│  ┌───────────────┐    ┌──────────────────────────────┐  │
│  │ zkRune SDK     │───>│ Generate proof (client-side) │  │
│  └───────────────┘    └──────────────────────────────┘  │
│          │                         │                     │
│          │          proof + publicSignals                │
│          │                         │                     │
│          ▼                         ▼                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ POST zkrune.com/api/verify-proof                 │   │
│  │   → server loads trusted vKey                    │   │
│  │   → returns { isValid: true/false }              │   │
│  └──────────────────────────────────────────────────┘   │
│          │                                               │
│          ▼                                               │
│  Grant or deny access                                   │
└─────────────────────────────────────────────────────────┘
```

## Quick Start — NPM

```bash
npm install zkrune-sdk snarkjs
```

```typescript
import { generateProof, verifyProofRemote, templates } from 'zkrune-sdk';

// 1. User fills in private data (stays in browser)
const result = await generateProof({
  templateId: templates.AGE_VERIFICATION,
  inputs: {
    birthYear: '1990',
    currentYear: '2026',
    minimumAge: '18',
  },
});

if (!result.success) throw new Error(result.error);

// 2. Verify against hosted verifier (trusted vKey on server)
const { isValid } = await verifyProofRemote({
  circuitName: templates.AGE_VERIFICATION,
  proof: result.proof!.groth16Proof,
  publicSignals: result.proof!.publicSignals,
});

// 3. Grant or deny access
if (isValid) {
  grantAccess();
}
```

## Quick Start — Script Tag

For apps that don't use a bundler:

```html
<script src="https://cdn.jsdelivr.net/npm/snarkjs@latest/build/snarkjs.min.js"></script>
<script type="module">
  import { generateProof, verifyProofRemote } from 'https://esm.sh/zkrune-sdk';

  const result = await generateProof({
    templateId: 'age-verification',
    inputs: { birthYear: '1990', currentYear: '2026', minimumAge: '18' },
  });

  if (result.success) {
    const { isValid } = await verifyProofRemote({
      circuitName: 'age-verification',
      proof: result.proof.groth16Proof,
      publicSignals: result.proof.publicSignals,
    });
    console.log('Verified:', isValid);
  }
</script>
```

## Hosted Verifier API

**Endpoint:** `POST https://zkrune.com/api/verify-proof`

**Request:**
```json
{
  "circuitName": "age-verification",
  "proof": { "pi_a": [...], "pi_b": [...], "pi_c": [...] },
  "publicSignals": ["1"]
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "circuitName": "age-verification",
  "timing": 2
}
```

The server loads the trusted verification key from its own filesystem. Never accept a client-supplied vKey.

## Supported Circuits

| Circuit | Template ID | MVP Status |
|---------|-------------|------------|
| Age Verification | `age-verification` | Core MVP |
| Membership Proof | `membership-proof` | Core MVP |
| Balance Proof | `balance-proof` | Core MVP |
| Hash Preimage | `hash-preimage` | Production |
| Private Voting | `private-voting` | Production |
| Credential Proof | `credential-proof` | Self-Asserted |
| Range Proof | `range-proof` | Self-Asserted |
| Others | See `templates` export | See [TRUST_MODEL.md](./TRUST_MODEL.md) |

## Verify Page

Every proof can also be verified interactively at:

**[zkrune.com/verify-proof](https://zkrune.com/verify-proof)**

Users can paste or upload a proof JSON and see verification results instantly.

## Trust Model

See [TRUST_MODEL.md](./TRUST_MODEL.md) for a full classification of what each proof guarantees and what it does not.

## Self-Hosting

To run the verifier on your own infrastructure:

1. Clone the repo and deploy to Vercel / Node.js
2. Circuit artifacts (WASM + vKey) are in `public/circuits/`
3. The verify endpoint at `app/api/verify-proof/route.ts` loads vKeys from the server filesystem
4. Point `verifierUrl` in `verifyProofRemote()` to your own deployment
