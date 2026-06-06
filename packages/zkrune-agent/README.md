# zkrune-agent — zkAgent Passport

Open ZK selective-disclosure validation layer for AI agents. Give any agent a
portable passport, then bind a **fresh, action-scoped zero-knowledge attestation**
to every request (MCP / A2A / x402). Anyone can verify it statelessly — no
database, no shared state.

It sits **under** the emerging standards rather than creating a new format: the
attestation maps onto **ERC-8004 Trustless Agents** (Validation Registry) and
flows as request headers.

## Light mode (v1)

v1 proves three things, all fully ZK-native, with **zero new trusted setup** —
it reuses zkRune's existing `signature-verification` circuit:

- **Delegated authority** — a human delegated this policy to this agent key.
- **Human-in-the-loop** — for sensitive actions, a fresh human signature is bound
  to the specific action.
- **Freshness** — the attestation carries a signed timestamp; the verifier checks
  it against a TTL window.

Constraint enforcement (`maxSpend`, `onlyDomains`) is carried and committed in v1
but enforced in-circuit in **v1.1** (the composed `agent-action` circuit, which
needs one ceremony). Issuer-attested provenance lands in **v2**.

> Honesty note: zkRune **verifies** issuer-attested provenance; it does not
> generate proof-of-training, and never claims ZK proves data is "licensed".

## How binding works

The per-action proof is the `signature-verification` circuit over a bound message:

```
M = Poseidon(actionDigest ‖ issuedAt ‖ agentId)
```

`M` is a public signal of the circuit, so the binding is free. The verifier
recomputes `M` from the claimed action + timestamp + signer key and rejects if it
doesn't match the proof's public signal — so a proof can't be replayed onto a
different action, and a stale proof falls outside the TTL window.

## Usage

```ts
import { AgentPassport, verifyAttestation, createSdkBackend } from 'zkrune-agent';
import { ZkRune } from 'zkrune-sdk';

const backend = createSdkBackend(new ZkRune());

// 1) Mint once (the human delegates a policy to the agent key)
const passport = await AgentPassport.mint({
  humanSigner,            // implements AgentSigner (wallet)
  agentSigner,            // the agent's own key
  policy: { maxSpend: '500 USDC', onlyDomains: ['*.example.com'], humanInLoop: true },
  backend,
});

// 2) Attest each action — returns headers to attach to the request
const headers = await passport.attest({
  action: { method: 'POST', target: 'https://api.example.com/pay', amount: '120 USDC',
            externalId: paymentIntentId },
  approver: humanSigner,  // fresh human approval (humanInLoop policies)
});

// 3) Relying party verifies statelessly
const result = await verifyAttestation(headers, backend, { ttlSeconds: 300 });
if (!result.ok) throw new Error(result.reasons.join('; '));
```

## Relying-party gate (x402 / MCP / A2A)

Gate any endpoint on a valid passport, mirroring the `@louisstein/x402-verify`
shape — same 403 challenge, same retry loop. Works with Express, Hono, or any
Fetch-API runtime.

```ts
import { agentPassportFetchGuard, localGroth16Backend } from 'zkrune-agent';
import vkey from './signature-verification_vkey.json';

const guard = agentPassportFetchGuard({
  backend: localGroth16Backend(vkey),   // verify-only (snarkjs, optional peer dep)
  enforceDomain: true,                  // action target must match delegated onlyDomains
  requireHumanInLoop: true,
  ttlSeconds: 300,
});

export async function POST(req: Request) {
  const blocked = await guard(req);
  if (blocked) return blocked;          // 403 challenge or 503 if verifier is down
  // ...x402 payment check, then serve
}
```

The gate enforces `onlyDomains` / `maxSpend` by comparing the action against the
**delegated** policy. This is sound in light mode: both the policy (via the
human's delegation signature) and the concrete action (via the bound message M)
are signature-verified, so the comparison is over established values, not client
claims. The v1.1 circuit only adds ZK-*hiding* of the amount — moot for a relying
party that already sees the action it serves.

## Replay protection (three layers, by need)

1. **Action-binding (always)** — the proof is bound to `actionHash`; not portable.
2. **External idempotency (stateless)** — bind `action.externalId` to an id the
   relying party already deduplicates (x402 payment-intent id, MCP/A2A request id).
3. **Nullifier registry (optional)** — for high-value actions a relying party may
   keep a nullifier set to also close the within-TTL window.

## Status

Pre-release scaffold (v0.1.0). The proving/verifying backend is injected
(`ProofBackend`) so the package builds and unit-tests without circuit artefacts;
wire it to `zkrune-sdk` with `createSdkBackend()`. See
`business/pitch/zkagent-passport-plan.md` for the full build plan.
