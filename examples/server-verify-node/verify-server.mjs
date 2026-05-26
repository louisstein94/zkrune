// Server-side verification with the zkRune hosted verifier.
//
// A minimal Node 18+ HTTP server that accepts a zero-knowledge proof
// from your front-end, forwards it to https://zkrune.com/api/verify-proof,
// and responds 200 (granted) / 403 (denied).
//
// This is the pattern most B2B integrations use: the browser generates
// the proof locally with the SDK or widget, then sends it to the
// application's own backend for gating logic. Your backend never sees
// the user's private inputs.
//
// Run:    node verify-server.mjs
// Test:   node test-client.mjs   (see ./test-client.mjs)

import http from 'node:http';

const PORT = process.env.PORT || 3000;
const ZKRUNE_API = process.env.ZKRUNE_API || 'https://zkrune.com/api/verify-proof';

const server = http.createServer(async (req, res) => {
  // Only POST /check is gated. Everything else is a 404.
  if (req.method !== 'POST' || req.url !== '/check') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  // Read the full request body, then forward to the zkRune verifier.
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      const { circuitName, proof, publicSignals } = JSON.parse(body);
      if (!circuitName || !proof || !publicSignals) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing circuitName, proof, or publicSignals' }));
        return;
      }

      const upstream = await fetch(ZKRUNE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuitName, proof, publicSignals }),
      });
      const data = await upstream.json();

      // Trust only `success === true && isValid === true`. The hosted
      // verifier returns success:false for circuits whose Groth16
      // verify call rejects the proof.
      if (data.success && data.isValid) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access: 'granted',
          circuitName: data.circuitName,
          attestation: data.attestation,
          proofTiming: data.timing,
        }));
      } else {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access: 'denied',
          reason: data.error || 'invalid or unverifiable proof',
        }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`▶ server-verify-node listening at http://localhost:${PORT}`);
  console.log(`▶ POST a proof to /check to test`);
  console.log(`▶ upstream verifier: ${ZKRUNE_API}`);
});
