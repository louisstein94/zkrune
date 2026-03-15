/**
 * Lightweight HTTP server that serves the snapshot data.
 *
 * Endpoints:
 *   GET /snapshot.json      — full snapshot (holders + Merkle paths)
 *   GET /snapshot-meta.json — metadata only (root, slot, timestamp)
 *   GET /health             — liveness check for Railway
 */

import * as http from "http";
import { getSnapshot, getSnapshotMeta } from "./snapshot";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export function startHttpServer(port: number): http.Server {
  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    const url = req.url?.split("?")[0];

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
        holders: meta?.totalHolders ?? 0,
        lastRefresh: meta?.timestamp ?? null,
      });
    }

    json(res, 404, { error: "Not found" });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[http] Snapshot server listening on 0.0.0.0:${port}`);
  });

  return server;
}
