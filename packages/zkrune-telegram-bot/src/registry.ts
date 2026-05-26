/**
 * BabyJubjub registration registry.
 *
 * Maps Solana addresses → registered BJJ pubkeys. Used by:
 *   - HTTP /register endpoint (writes)
 *   - snapshot.ts                (reads when building the tree)
 *
 * Persisted as a flat JSON file in STORE_DIR/registry.json so it survives
 * container restarts.
 *
 * Invariants:
 *   - Each Solana address maps to at most one BJJ pubkey (latest wins).
 *   - Each BJJ pubkey is bound to at most one Solana address.
 *   - Signature over the canonical message must verify under the Solana key.
 */

import * as fs from "fs";
import * as path from "path";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

export interface RegistryEntry {
  bjjPubkeyX: string;       // decimal string of the BN254 field element
  bjjPubkeyY: string;
  signature: string;        // base58 of 64-byte Ed25519 sig
  message: string;          // exact message that was signed
  registeredAt: number;     // Unix seconds
}

export interface Registry {
  // Keyed by Solana base58 address.
  [solanaAddress: string]: RegistryEntry;
}

// Canonical message format the registration page must sign. Bot enforces this
// exactly so the signature can't be replayed as a generic Solana sign request.
export function buildRegistrationMessage(
  bjjPubkeyX: string,
  bjjPubkeyY: string,
  tokenSymbol: string,
): string {
  return (
    `zkRune ${tokenSymbol} whale-chat registration\n` +
    `\n` +
    `Binding BabyJubjub identity to this Solana address.\n` +
    `\n` +
    `BJJ pubkey X: ${bjjPubkeyX}\n` +
    `BJJ pubkey Y: ${bjjPubkeyY}\n`
  );
}

export class RegistryStore {
  private file: string;

  constructor(storeDir: string) {
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
    this.file = path.join(storeDir, "registry.json");
  }

  load(): Registry {
    try {
      return JSON.parse(fs.readFileSync(this.file, "utf-8"));
    } catch {
      return {};
    }
  }

  private save(reg: Registry): void {
    fs.writeFileSync(this.file, JSON.stringify(reg, null, 2));
  }

  /**
   * Look up a Solana address's registered BJJ pubkey, if any.
   */
  get(solanaAddress: string): RegistryEntry | null {
    return this.load()[solanaAddress] ?? null;
  }

  /**
   * Register a new (solanaAddress, bjjPubkey) binding.
   *
   * Returns `{ ok: true }` on success, `{ ok: false, reason }` on validation
   * failure (bad signature, BJJ pubkey already bound to a different address,
   * etc.). Never throws on validation errors.
   */
  register(input: {
    solanaAddress: string;
    bjjPubkeyX: string;
    bjjPubkeyY: string;
    signature: string;
    tokenSymbol: string;
  }): { ok: true } | { ok: false; reason: string } {
    const { solanaAddress, bjjPubkeyX, bjjPubkeyY, signature, tokenSymbol } = input;

    // ── 1. Validate Solana address ─────────────────────────────────────────
    let solanaPubkeyBytes: Uint8Array;
    try {
      solanaPubkeyBytes = new PublicKey(solanaAddress).toBytes();
    } catch {
      return { ok: false, reason: "invalid Solana address" };
    }

    // ── 2. Validate BJJ pubkey coordinates are decimal strings ─────────────
    if (!/^[0-9]+$/.test(bjjPubkeyX) || !/^[0-9]+$/.test(bjjPubkeyY)) {
      return { ok: false, reason: "BJJ pubkey coordinates must be decimal strings" };
    }

    // ── 3. Verify Ed25519 signature over the canonical message ─────────────
    const message = buildRegistrationMessage(bjjPubkeyX, bjjPubkeyY, tokenSymbol);
    const messageBytes = new TextEncoder().encode(message);
    let signatureBytes: Uint8Array;
    try {
      signatureBytes = bs58.decode(signature);
    } catch {
      return { ok: false, reason: "signature is not valid base58" };
    }
    if (signatureBytes.length !== 64) {
      return { ok: false, reason: "signature must be 64 bytes (Ed25519)" };
    }
    const sigValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      solanaPubkeyBytes,
    );
    if (!sigValid) {
      return { ok: false, reason: "signature does not verify under this Solana address" };
    }

    // ── 4. Uniqueness: BJJ pubkey must not already be bound to a different address
    const reg = this.load();
    for (const [addr, entry] of Object.entries(reg)) {
      if (addr === solanaAddress) continue;
      if (entry.bjjPubkeyX === bjjPubkeyX && entry.bjjPubkeyY === bjjPubkeyY) {
        return {
          ok: false,
          reason: "this BJJ pubkey is already bound to a different Solana address",
        };
      }
    }

    // ── 5. Persist (latest-wins for solanaAddress → bjj) ───────────────────
    reg[solanaAddress] = {
      bjjPubkeyX,
      bjjPubkeyY,
      signature,
      message,
      registeredAt: Math.floor(Date.now() / 1000),
    };
    this.save(reg);
    return { ok: true };
  }
}
