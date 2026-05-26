# Server-side verification (Node http)

A pattern most B2B integrations follow: the browser generates the proof
locally with the SDK or widget, then sends it to your own backend for
gating logic. Your backend never sees the user's private inputs — only
the proof object and the public signals declared by the circuit.

This example is a minimal Node 18+ HTTP server (zero npm dependencies,
uses only the built-in `node:http` module and global `fetch`) that
forwards a posted proof to `https://zkrune.com/api/verify-proof`,
then responds `200` (granted) or `403` (denied).

## What this demonstrates

- The thin proxy pattern: your service does business logic; zkRune
  does cryptography. The hosted verifier is the only thing that loads
  the trusted verification key.
- Distinguishing `attestation: "self-asserted"` vs `"attested"` for
  high-stakes flows like balance proofs.
- No npm dependencies on the server. The example fits in ~60 lines.

## Run it

```bash
node verify-server.mjs
# ▶ server-verify-node listening at http://localhost:3000
# ▶ POST a proof to /check to test
```

In another terminal, generate a real proof and send it:

```bash
# From the repo root (so snarkjs resolves):
cd ../..
node examples/server-verify-node/test-client.mjs
# ▶ generating proof
# ▶ publicSignals: ["1","2026","18"]
# ▶ POST http://localhost:3000/check
# HTTP 200
# { access: 'granted', circuitName: 'age-verification', attestation: 'self-asserted', proofTiming: <ms> }
```

## Configuration

| Env var      | Default                                | Purpose                                       |
| ------------ | -------------------------------------- | --------------------------------------------- |
| `PORT`       | `3000`                                 | Local port the gating server listens on.      |
| `ZKRUNE_API` | `https://zkrune.com/api/verify-proof`  | Upstream verifier. Point to self-hosted here. |

## Production hardening checklist

This example is intentionally minimal. Before deploying, add:

1. **Request body size cap** (e.g. 32 KB) — reject anything larger.
2. **Rate limiting** per-IP and per-account.
3. **Authentication** — sign every request from your frontend so a
   replay attacker cannot reuse a valid proof from another session.
   The proof itself is just a blob; binding it to a user session is
   your application's job.
4. **Audit logging** — log `proofHash`, `circuitName`, `attestation`,
   and `timing` per request (never log the proof object itself or any
   client-supplied PII).
5. **Timeouts** on the upstream fetch (10–30 seconds is generous;
   verification usually completes in <50 ms after a cold start).

## Files

- `verify-server.mjs` — the gating server (~65 lines)
- `test-client.mjs` — generates a real proof and exercises the server
