#!/usr/bin/env node
/**
 * Register all zkRune circuit VKs on Sui (devnet/testnet) via register_circuit PTBs.
 *
 * Prerequisites:
 *   - npm install (repo root) — uses @mysten/sui
 *   - sui-groth16-verifier/vk_data.json (npm run sui:generate-vk)
 *   - Publish package first (scripts/sui/deploy-devnet.sh)
 *
 * Env (required):
 *   SUI_PACKAGE_ID, SUI_VERIFIER_REGISTRY_ID, SUI_ADMIN_CAP_ID
 * Env (optional):
 *   SUI_NETWORK=devnet|testnet|mainnet (default devnet)
 *   SUI_RPC_URL — overrides default fullnode
 *   SUI_PRIVATE_KEY — 64 hex chars (32-byte seed), or suiprivkey1… bech32 from `sui keytool export`
 *   SUI_KEYSTORE_PATH — override path to sui_keystore file
 *   SUI_REGISTER_ONLY — comma-separated template IDs (e.g. "0" for smoke test)
 *   SUI_SIGNER_ADDRESS — if keystore has several keys, force the one that must sign (must own AdminCap)
 *
 * If no SUI_PRIVATE_KEY: reads keystore from SUI_KEYSTORE_PATH, ~/.sui/sui_config/client.yaml
 * (keystore.File), or ~/.sui/sui_keystore. The signer MUST be the address that owns AdminCap
 * (same as `sui client publish`); if the keystore has multiple keys, the script picks the match.
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { config as loadEnv } from 'dotenv';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

loadEnv({ path: join(REPO_ROOT, '.env.local') });
loadEnv({ path: join(REPO_ROOT, '.env') });

function homeDir() {
  return process.env.HOME || process.env.USERPROFILE || homedir();
}

/** Parse `keystore:` → `File:` path from Sui client.yaml */
function keystorePathFromClientYaml() {
  const yamlPath = join(homeDir(), '.sui', 'sui_config', 'client.yaml');
  if (!existsSync(yamlPath)) return null;
  const text = readFileSync(yamlPath, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*keystore:\s*$/.test(lines[i])) {
      const next = lines[i + 1];
      const m =
        next?.match(/^\s*File:\s*(.+?)\s*$/) ||
        next?.match(/^\s*Path:\s*(.+?)\s*$/);
      if (m) {
        let p = m[1].replace(/^["']|["']$/g, '').trim();
        if (p.startsWith('~/')) p = join(homeDir(), p.slice(2));
        else if (p === '~') p = homeDir();
        return p;
      }
    }
  }
  return null;
}

function resolveKeystorePath() {
  const tried = [];
  const push = (p) => {
    if (p && !tried.includes(p)) tried.push(p);
  };
  if (process.env.SUI_KEYSTORE_PATH?.trim()) {
    push(process.env.SUI_KEYSTORE_PATH.trim());
  }
  const fromYaml = keystorePathFromClientYaml();
  if (fromYaml) push(fromYaml);
  push(join(homeDir(), '.sui', 'sui_keystore'));
  push(join(homeDir(), '.local', 'share', 'sui', 'sui_keystore'));

  for (const p of tried) {
    if (existsSync(p)) return { path: p, tried };
  }
  return { path: null, tried };
}

function normAddr(a) {
  const s = String(a).toLowerCase().trim();
  return s.startsWith('0x') ? s : `0x${s}`;
}

function addressFromOwnerField(owner) {
  if (!owner || typeof owner !== 'object') return null;
  if ('AddressOwner' in owner) return owner.AddressOwner;
  return null;
}

function keypairFromKeystoreEntry(entry) {
  if (typeof entry !== 'string') return null;
  if (entry.startsWith('suiprivkey')) {
    return Ed25519Keypair.fromSecretKey(entry);
  }
  const buf = Buffer.from(entry, 'base64');
  if (buf.length < 32) return null;
  const sk = buf.subarray(0, 32);
  return Ed25519Keypair.fromSecretKey(sk);
}

function keypairFromPrivateKeyEnv() {
  const rawPk = process.env.SUI_PRIVATE_KEY?.trim();
  if (!rawPk) return null;
  if (/^suiprivkey1/i.test(rawPk)) {
    return Ed25519Keypair.fromSecretKey(rawPk);
  }
  const hex = rawPk.replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return Ed25519Keypair.fromSecretKey(Buffer.from(hex, 'hex'));
  }
  throw new Error(
    'SUI_PRIVATE_KEY must be 64 hex chars (32-byte seed) or suiprivkey1… (sui keytool export).',
  );
}

function allKeypairsFromKeystoreFile() {
  const { path: ks, tried } = resolveKeystorePath();
  if (!ks) {
    throw new Error(
      `No keystore found. Tried:\n  ${tried.join('\n  ')}\n` +
        'Fix: set SUI_KEYSTORE_PATH, or set SUI_PRIVATE_KEY for the publish wallet.',
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(ks, 'utf8'));
  } catch (e) {
    throw new Error(`Invalid JSON in keystore ${ks}: ${e.message}`);
  }

  const keys = Array.isArray(parsed)
    ? parsed
    : parsed.keys ?? parsed.keypairs ?? [];
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error(`Keystore has no keys: ${ks}`);
  }

  const pairs = [];
  for (const entry of keys) {
    try {
      const kp = keypairFromKeystoreEntry(entry);
      if (kp) pairs.push(kp);
    } catch {
      /* skip bad entry */
    }
  }
  if (pairs.length === 0) {
    throw new Error(`No loadable keys in ${ks}`);
  }
  return pairs;
}

async function resolveKeypair(client, adminCapId) {
  const res = await client.getObject({
    id: adminCapId,
    options: { showOwner: true },
  });
  if (res.error) {
    throw new Error(`getObject AdminCap: ${res.error.message}`);
  }
  if (!res.data) {
    throw new Error(`AdminCap not found: ${adminCapId}`);
  }
  const ownerAddr = addressFromOwnerField(res.data.owner);
  if (!ownerAddr) {
    throw new Error(
      `Unexpected AdminCap owner: ${JSON.stringify(res.data.owner)}`,
    );
  }
  const need = normAddr(ownerAddr);

  const forced = process.env.SUI_SIGNER_ADDRESS?.trim();
  if (forced && normAddr(forced) !== need) {
    throw new Error(
      `SUI_SIGNER_ADDRESS ${forced} does not own AdminCap; owner on chain is ${ownerAddr}`,
    );
  }

  const fromEnv = keypairFromPrivateKeyEnv();
  if (fromEnv) {
    const got = normAddr(fromEnv.toSuiAddress());
    if (got !== need) {
      throw new Error(
        `SUI_PRIVATE_KEY signs as ${got} but AdminCap is owned by ${ownerAddr} (publish cüzdanı ile aynı olmalı). ` +
          `Çözüm: o cüzdanın anahtarını export et (sui keytool export --key-identity ${ownerAddr}) ve SUI_PRIVATE_KEY yap, ` +
          `veya keystore’ta bu adresi içeren anahtarı kullan ve SUI_PRIVATE_KEY’yi kaldır.`,
      );
    }
    return fromEnv;
  }

  let candidates = allKeypairsFromKeystoreFile();
  if (forced) {
    const f = normAddr(forced);
    candidates = candidates.filter((kp) => normAddr(kp.toSuiAddress()) === f);
  }
  const match = candidates.find((kp) => normAddr(kp.toSuiAddress()) === need);
  if (match) return match;

  const have = candidates.map((kp) => kp.toSuiAddress()).join(', ');
  throw new Error(
    `AdminCap sahibi: ${ownerAddr}. Keystore’taki adresler: ${have || '(yok)'}. ` +
      `Publish yaptığın cüzdanın anahtarı gerekli. ` +
      `sui client active-address ile kontrol et; ` +
      `sui keytool export --key-identity ${ownerAddr} çıktısını SUI_PRIVATE_KEY olarak ekle.`,
  );
}

function filterCircuits(circuits) {
  const only = process.env.SUI_REGISTER_ONLY?.trim();
  if (!only) return circuits;
  const ids = new Set(
    only.split(',').map((s) => parseInt(s.trim(), 10)),
  );
  return circuits.filter((c) => ids.has(c.templateId));
}

async function main() {
  const packageId = process.env.SUI_PACKAGE_ID?.trim();
  const registryId = process.env.SUI_VERIFIER_REGISTRY_ID?.trim();
  const adminCapId = process.env.SUI_ADMIN_CAP_ID?.trim();
  const network = process.env.SUI_NETWORK?.trim() || 'devnet';

  if (!packageId || !registryId || !adminCapId) {
    console.error(
      'Missing env. Set SUI_PACKAGE_ID, SUI_VERIFIER_REGISTRY_ID, SUI_ADMIN_CAP_ID',
    );
    process.exit(1);
  }

  const vkPath = join(REPO_ROOT, 'sui-groth16-verifier', 'vk_data.json');
  if (!existsSync(vkPath)) {
    console.error('Missing vk_data.json. Run: npm run sui:generate-vk');
    process.exit(1);
  }

  let circuits = JSON.parse(readFileSync(vkPath, 'utf8'));
  circuits = filterCircuits(circuits);
  if (circuits.length === 0) {
    console.error('No circuits to register (check SUI_REGISTER_ONLY).');
    process.exit(1);
  }

  const url = process.env.SUI_RPC_URL?.trim() || getFullnodeUrl(network);
  const client = new SuiClient({ url });
  const keypair = await resolveKeypair(client, adminCapId);
  const sender = keypair.toSuiAddress();
  console.log('Network:', network, 'RPC:', url);
  console.log('Signer (AdminCap owner):', sender);
  console.log('Registering', circuits.length, 'circuit(s)...\n');

  for (const c of circuits) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::groth16_verifier::register_circuit`,
      arguments: [
        tx.object(adminCapId),
        tx.object(registryId),
        tx.pure.u8(c.templateId),
        tx.pure.vector('u8', [...Buffer.from(c.name, 'utf8')]),
        tx.pure.vector('u8', [...Buffer.from(c.vkHex, 'hex')]),
        tx.pure.u8(c.nPublic),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true, showObjectChanges: true },
    });

    const st = result.effects?.status?.status;
    if (st !== 'success') {
      console.error('Failed:', c.name, result.effects?.status);
      process.exit(1);
    }
    console.log(`OK ${c.name} (id=${c.templateId}) digest=${result.digest}`);
  }

  console.log('\nDone. Test with a real proof via verify_proof (PTB) or the app.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
