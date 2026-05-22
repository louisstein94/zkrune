# @zkrune/x402-verify

Endpoint-level zero-knowledge eligibility gate for x402 services.

x402 answers **who paid**. zkRune answers **who is allowed**. This package
verifies a zkRune Groth16 proof against the on-chain verifier before your
endpoint serves a paid response — server-enforced, around 50 ms, no gas, no
wallet, no personal data.

It reads HTTP headers only. It never inspects or mutates the request body, so
it composes with any x402 handler regardless of what the endpoint does.

---

## Where it sits

A request to a regulated endpoint has three independent questions attached.
They are orthogonal — each can pass or fail on its own:

| Question | Answered by | Example |
|---|---|---|
| Is a unique human behind this agent? | Agentlink (Humanode) | freemium anti-Sybil |
| Did this request pay? | x402 | `$0.06` USDC micro-payment |
| Is this caller allowed? | **zkRune** | 18+, in a permitted jurisdiction, holds a license |

Xona already runs the first two. `@zkrune/x402-verify` adds the third. The gate
runs alongside the x402 payment check — both must pass, order does not matter.

---

## How it works

```
client                         x402 endpoint
  |  POST /image/flux-2-flex      |
  |  (no zkRune headers)          |
  |------------------------------>|
  |   403 zkrune_eligibility_required
  |<------------------------------|   { circuit, verifier, generateProofAt }
  |                               |
  |  generate proof at zkrune.com (in the browser / agent SDK, ~0.5s)
  |                               |
  |  POST /image/flux-2-flex      |
  |  X-Payment: <x402 ...>        |
  |  X-zkRune-Proof: <base64 ...> |
  |  X-zkRune-Circuit: age-verification
  |------------------------------>|   verifyProofStatic() view call -> Base
  |   200  (image bytes)          |
  |<------------------------------|
```

The `403` rejection mirrors the x402 `402` challenge: it is self-describing,
so a client learns exactly which circuit to prove and retries — the same retry
loop x402 already uses for `X-Payment`.

---

## Header contract

A gated request carries three headers alongside the standard `X-Payment`:

| Header | Required | Value |
|---|---|---|
| `X-zkRune-Proof` | yes | base64 of `JSON.stringify({ proof, publicSignals })` |
| `X-zkRune-Circuit` | yes | circuit name, e.g. `age-verification` |
| `X-zkRune-Verifier` | no | `base` — informational; this package targets Base |

`proof` is a Groth16 proof in snarkjs shape (`pi_a`, `pi_b`, `pi_c`).
`publicSignals` is the array snarkjs emits. Together they are ~1–2 KB base64 —
well within HTTP header limits.

---

## Install

```bash
npm install @zkrune/x402-verify viem
```

`viem` is a peer dependency — the gate uses it for the read-only Base call.

---

## Usage

### Hono

```ts
import { Hono } from "hono";
import { zkRuneHonoMiddleware } from "@zkrune/x402-verify";

app.post(
  "/image/flux-2-flex",
  zkRuneHonoMiddleware({ requiredCircuit: "age-verification" }),
  x402(),          // existing payment middleware, unchanged
  fluxHandler,     // existing handler, unchanged
);
```

### Express

```ts
import { zkRuneExpressMiddleware } from "@zkrune/x402-verify";

app.post(
  "/image/flux-2-flex",
  zkRuneExpressMiddleware({ requiredCircuit: "age-verification" }),
  x402PaymentMiddleware(),
  fluxHandler,
);
```

### Next.js route handler / Fetch runtimes

```ts
import { zkRuneFetchGuard } from "@zkrune/x402-verify";

const guard = zkRuneFetchGuard({ requiredCircuit: "age-verification" });

export async function POST(req: Request) {
  const blocked = await guard(req);
  if (blocked) return blocked;          // 403 challenge or 503
  // ...x402 payment check, then serve
}
```

See [`examples/flux-2-flex.ts`](./examples/flux-2-flex.ts) for the full wiring
against Xona's real endpoint.

---

## Public-signal policy

A valid proof only means the math checks out. To pin *what* was proven, pass
`validatePublicSignals`. For `age-verification`, snarkjs emits public signals
as `[isValid, currentYear, minimumAge]`:

```ts
zkRuneHonoMiddleware({
  requiredCircuit: "age-verification",
  validatePublicSignals: (signals) => {
    const [isValid, currentYear, minimumAge] = signals.map(Number);
    const year = new Date().getUTCFullYear();
    return isValid === 1 &&
           (currentYear === year || currentYear === year - 1) &&
           minimumAge >= 18;
  },
});
```

Without this check, a client could present a proof generated against a stale
year or a `minimumAge` of zero. The circuit guarantees the *relation*; the
endpoint pins the *parameters*.

---

## Available circuits

The verifier supports 13 production circuits. The ones most relevant to a
creative-AI endpoint:

| Circuit | Proves |
|---|---|
| `age-verification` | age ≥ a threshold, without revealing the birth year |
| `membership-proof` | membership in an allow-list (e.g. permitted jurisdictions) |
| `credential-proof` | holding a valid, unexpired credential or license |
| `balance-proof` | a token balance ≥ a threshold, without revealing the balance |
| `whale-holder` | holdings above a tier, without revealing the wallet |

Full list and circuit sources: <https://zkrune.com>

---

## Hardening — known limitation

The `age-verification` circuit's public signals are `(currentYear, minimumAge)`
with no nullifier. A captured `X-zkRune-Proof` header is therefore **replayable**
— anyone who observes it can present the same proof again.

For age gating this is low severity: a replayed proof still attests a true
"18+" claim and leaks no personal data. For balance or holdings gating it
matters more. Two hardening options for v2, available on request:

1. **Bind the proof to the payment.** Include the x402 payment transaction
   hash as a public input, so a proof is only valid for one paid request.
2. **Nullifier + freshness window.** Add a per-proof nullifier and a signed
   timestamp; the endpoint rejects reused nullifiers and stale proofs.

Both are circuit-level changes on the zkRune side — no change to this package's
header contract.

---

## Verifier

| Chain | Contract | Call |
|---|---|---|
| Base mainnet | `0xa03A353d890033aC9b3044776440C2a4c9E849EA` | `verifyProofStatic` (view) |

Solana and Sui verifiers accept the same proof envelope through a different
call interface. Contact zkRune to gate against those.

---

## Contact

zkRune — <https://zkrune.com> · <zkruneprotocol@gmail.com>

Reference integration: <https://zkrune.com/integrations/xona>
