# Agent RWA eligibility gate

An AI agent proving **tokenized-RWA eligibility** to a gated endpoint, in the
same challenge/retry shape x402 uses for payment.

> x402 answers *"who paid?"*. zkRune answers *"who is allowed?"*.

Tokenized-RWA venues (Robinhood Chain, xStocks, Ondo, …) need to know a caller
is eligible to trade — accredited, KYC-cleared, in an allowed jurisdiction —
before a transfer clears. Today that means handing personal data to a central
KYC provider. This example shows the alternative: the agent proves it holds a
valid, unexpired **issuer-attested** eligibility credential in zero knowledge,
and the endpoint verifies that proof **on-chain** before authorizing the trade.

zkRune verifies the issuer's attestation. It does not establish accreditation
itself — the credential is issued off-platform by a broker or KYC provider.

## What it shows

| File               | Role   | What it does                                                            |
| ------------------ | ------ | ----------------------------------------------------------------------- |
| `gate-server.mjs`  | server | A tokenized-RWA venue that requires a `credential-proof` before serving. Uses `@zkrune/x402-verify`; verifies the proof on Base via a view call — no gas. |
| `agent-client.mjs` | agent  | An autonomous caller: hits the resource, reads the 403 challenge, generates the proof, retries with the proof headers. |

The gate reads **only headers** — it never touches the request body, so it
drops in next to an existing x402 payment check on the same route. Both must
pass; order does not matter.

## Run it

```bash
npm install

# shell 1 — the gated venue
node gate-server.mjs

# shell 2 — the agent
node agent-client.mjs
```

Expected output from the agent:

```
[1] no proof        -> 403
    challenge: prove "credential-proof" at https://zkrune.com/verify-proof
[2] generating credential-proof (zk-SNARK) ...
[3] with proof      -> 200
    {"ok":true,"message":"Eligibility verified on-chain — tokenized-RWA trade authorized."}
```

Step 3 is a real Groth16 verification against the zkRune verifier contract on
Base mainnet — not a mock.

## The request flow

```
agent                         gated venue                 Base verifier
  │   POST /rwa/trade  ─────────▶ │                              │
  │ ◀───────  403 + challenge ─── │  (which circuit, where)      │
  │                               │                              │
  │ generate credential-proof     │                              │
  │   (reveals nothing)           │                              │
  │                               │                              │
  │   POST + X-zkRune-Proof ────▶ │ ── verifyProofStatic ──────▶ │
  │                               │ ◀──────────── true ───────── │
  │ ◀──────────  200  ─────────── │                              │
```

## Configuration

| Env var                   | Default                          | Purpose                                        |
| ------------------------- | -------------------------------- | ---------------------------------------------- |
| `PORT`                    | `4021`                           | Gate server port.                              |
| `BASE_RPC_URL`            | public Base RPC                  | Use a private RPC for production traffic.      |
| `TRUSTED_CREDENTIAL_HASH` | demo hash                        | The issuer credential hash the venue pins.     |
| `VENUE_URL`               | `http://localhost:4021/rwa/trade`| Where the agent sends its requests.            |
| `ZKRUNE_BASE_URL`         | `https://zkrune.com`             | Where the agent fetches circuit artifacts.     |
| `CREDENTIAL_HASH`         | demo hash                        | The agent's issuer-attested credential.        |

## Before production

- **Pin the real issuer hash.** Replace the demo `TRUSTED_CREDENTIAL_HASH` with
  the credential hash your accreditation / KYC issuer actually published.
- **Use a private Base RPC.** The public endpoint rate-limits; set `BASE_RPC_URL`.
- **Add replay defense.** The freshness window in `eligibilityPolicy` is a
  starting point; bind proofs to a nonce or session if your threat model needs it.
- **Keep the payment check.** This gate answers eligibility only — run it
  alongside your x402 payment middleware, not instead of it.

## More

- Package: [`@zkrune/x402-verify`](https://www.npmjs.com/package/@zkrune/x402-verify)
- Full documentation: [zkrune.com/docs](https://zkrune.com/docs)
- Circuit catalogue: [zkrune.com/docs/circuits](https://zkrune.com/docs/circuits)
- Trust model and audit roadmap: [zkrune.com/trust](https://zkrune.com/trust)
