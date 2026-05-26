# Age gate (script-tag widget)

Single-file age-gate using the zkRune widget delivered from a CDN. No
build step, no npm install. Open `index.html` in any browser and the
"Verify I am 18+" button works immediately.

## What this demonstrates

- Embedding the zkRune widget on a static page with one `<script>` tag.
- Gating content behind a successful zero-knowledge age proof.
- The fact that the *server* never sees the user's birth year — the
  proof is generated client-side and verified against an immutable
  verification key on `zkrune.com/api/verify-proof`.

## Run it

```bash
open index.html
# or
python3 -m http.server 8080   # then visit http://localhost:8080
```

Some browsers refuse to load CDN scripts from a `file://` URL. Serving
from any local web server (`python3 -m http.server`, `npx serve`,
`live-server`, etc.) avoids this.

## Production checklist

When you adapt this to your own site:

1. Replace `circuit: 'age-verification'` with the circuit that matches
   your use case (see the [circuit catalogue](https://zkrune.com/docs/circuits)).
2. Trust the **server-verified** result, not the client-side
   `onResult`. The widget displays the verification banner only after
   the hosted verifier confirms; for high-stakes flows, additionally
   send the proof to your own backend that re-verifies via the API
   (see `../server-verify-node`).
3. If you self-host the verifier, set `verifierUrl` to your
   deployment.
4. Pin `zkrune-widget@<version>` and `snarkjs@<version>` instead of
   `@latest` in production to guarantee reproducibility.

## Files

- `index.html` — entire example (~75 lines)
