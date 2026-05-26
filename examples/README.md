# zkRune integration examples

Short, runnable, copy-pasteable examples covering the two integration
surfaces most B2B teams use: the client-side widget and a server-side
proxy that calls the hosted verifier.

Each example is self-contained — open the folder, read the local
`README.md`, run the file. No monorepo setup required.

## Examples

| Example                                            | Surface       | What it shows                                                          | Lines |
| -------------------------------------------------- | ------------- | ---------------------------------------------------------------------- | ----- |
| [`age-gate-widget`](./age-gate-widget)             | Browser       | Drop-in age gate using the script-tag widget. No build step.           | ~75   |
| [`server-verify-node`](./server-verify-node)       | Backend       | Node `http` proxy that forwards proofs to the hosted verifier.          | ~65   |

The two are complementary: the browser generates the proof with the
widget, your backend re-verifies it with the proxy before granting
access. Together they form the full request flow most B2B integrations
implement.

## Adapting these for production

Both examples are intentionally minimal so the integration story is
visible at a glance. Each `README.md` ends with a production-hardening
checklist (size caps, rate limits, request signing, audit logging,
upstream timeouts). Read those before shipping to real traffic.

## More

- Full documentation: [zkrune.com/docs](https://zkrune.com/docs)
- API reference + OpenAPI spec: [zkrune.com/docs/api](https://zkrune.com/docs/api) ·
  [`zkrune.com/openapi.yaml`](https://zkrune.com/openapi.yaml)
- Widget reference: [zkrune.com/docs/widget](https://zkrune.com/docs/widget)
- Circuit catalogue: [zkrune.com/docs/circuits](https://zkrune.com/docs/circuits)
- Trust model and audit roadmap: [zkrune.com/trust](https://zkrune.com/trust)

Found a bug or want a new example? Open an issue at
[github.com/louisstein94/zkrune](https://github.com/louisstein94/zkrune).
