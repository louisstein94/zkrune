/**
 * Lightweight HTTP server that serves snapshot data and accepts BJJ
 * registration submissions for the v2 ownership-bound flow.
 *
 * Endpoints:
 *   GET  /snapshot.json              — full snapshot (tree + pending)
 *   GET  /snapshot-meta.json         — metadata only
 *   GET  /health                     — liveness check
 *   GET  /registration-message       — canonical message to sign for registration
 *   POST /register                   — submit Solana-signed BJJ binding
 *   GET  /registration/:solanaAddr   — look up an existing binding (no secrets)
 */

import * as http from "http";
import { getSnapshot, getSnapshotMeta } from "./snapshot";
import { RegistryStore, buildRegistrationMessage } from "./registry";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...CORS_HEADERS,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJsonBody(req: http.IncomingMessage, maxBytes = 64_000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export function startHttpServer(port: number, storeDir: string, tokenSymbol: string): http.Server {
  const registry = new RegistryStore(storeDir);

  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    const url = req.url?.split("?")[0] ?? "";

    // ── Read endpoints (GET) ────────────────────────────────────────────────
    if (req.method === "GET") {
      if (url === "/snapshot.json") {
        const snap = getSnapshot();
        if (!snap) return json(res, 503, { error: "Snapshot not ready yet" });
        return json(res, 200, snap);
      }

      if (url === "/snapshot-meta.json") {
        const meta = getSnapshotMeta();
        if (!meta) return json(res, 503, { error: "Snapshot not ready yet" });
        return json(res, 200, meta);
      }

      if (url === "/health") {
        const meta = getSnapshotMeta();
        return json(res, 200, {
          status: "ok",
          snapshotReady: !!meta,
          totalWhales: meta?.totalWhales ?? 0,
          totalRegistered: meta?.totalRegistered ?? 0,
          totalPending: meta?.totalPending ?? 0,
          circuit: meta?.circuit ?? null,
          lastRefresh: meta?.timestamp ?? null,
          tokenSymbol,
        });
      }

      if (url === "/registration-message") {
        // The page calls this with ?x=...&y=... to fetch the exact bytes to sign.
        const qs = new URLSearchParams(req.url?.split("?")[1] ?? "");
        const x = qs.get("x");
        const y = qs.get("y");
        if (!x || !y) {
          return json(res, 400, { error: "missing x or y query param" });
        }
        return json(res, 200, {
          message: buildRegistrationMessage(x, y, tokenSymbol),
          tokenSymbol,
        });
      }

      const matchReg = url.match(/^\/registration\/([^\/]+)$/);
      if (matchReg) {
        const entry = registry.get(decodeURIComponent(matchReg[1]));
        if (!entry) return json(res, 404, { registered: false });
        return json(res, 200, {
          registered: true,
          bjjPubkeyX: entry.bjjPubkeyX,
          bjjPubkeyY: entry.bjjPubkeyY,
          registeredAt: entry.registeredAt,
        });
      }
    }

    // ── Write endpoints (POST) ──────────────────────────────────────────────
    if (req.method === "POST" && url === "/register") {
      let body: any;
      try {
        body = await readJsonBody(req);
      } catch (e: any) {
        return json(res, 400, { error: `invalid JSON body: ${e.message}` });
      }

      const { solanaAddress, bjjPubkeyX, bjjPubkeyY, signature } = body ?? {};
      if (
        typeof solanaAddress !== "string" ||
        typeof bjjPubkeyX !== "string" ||
        typeof bjjPubkeyY !== "string" ||
        typeof signature !== "string"
      ) {
        return json(res, 400, {
          error: "expected { solanaAddress, bjjPubkeyX, bjjPubkeyY, signature }",
        });
      }

      const result = registry.register({
        solanaAddress,
        bjjPubkeyX,
        bjjPubkeyY,
        signature,
        tokenSymbol,
      });

      if (!result.ok) {
        return json(res, 400, { error: result.reason });
      }
      return json(res, 200, { registered: true });
    }

    json(res, 404, { error: "Not found" });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[http] Server listening on 0.0.0.0:${port} (token=${tokenSymbol})`);
  });

  return server;
}
