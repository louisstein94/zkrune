#!/usr/bin/env node
/**
 * Replace each on-chain VK via update_circuit PTBs. Use this when circuits
 * have been recompiled and the registered VKs are stale.
 *
 * Env (required):
 *   SUI_PACKAGE_ID, SUI_VERIFIER_REGISTRY_ID, SUI_ADMIN_CAP_ID
 * Env (optional):
 *   SUI_NETWORK, SUI_RPC_URL, SUI_PRIVATE_KEY, SUI_KEYSTORE_PATH,
 *   SUI_REGISTER_ONLY (comma-separated template IDs), SUI_SIGNER_ADDRESS
 *
 * Key differences vs register-circuits.mjs:
 *  - Calls update_circuit instead of register_circuit.
 *  - Awaits finality (waitForTransaction) between txs so that sequential
 *    AdminCap mutations don't race on stale versions.
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

function keystorePathFromClientYaml() {
  const yamlPath = join(homeDir(), '.sui', 'sui_config', 'client.yaml');
  if (!existsSync(yamlPath)) return null;
  const text = readFileSync(yamlPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:File|Path):\s*(.+?)\s*$/);
    if (m) {
      let p = m[1].replace(/^["']|["']$/g, '').trim();
      if (p.startsWith('~/')) p = join(homeDir(), p.slice(2));
      return p;
    }
  }
  return null;
}

function resolveKeystorePath() {
  const tried = [];
  const push = (p) => p && !tried.includes(p) && tried.push(p);
  push(process.env.SUI_KEYSTORE_PATH?.trim());
  push(keystorePathFromClientYaml());
  push(join(homeDir(), '.sui', 'sui_keystore'));
  push(join(homeDir(), '.local', 'share', 'sui', 'sui_keystore'));
  for (const p of tried) if (existsSync(p)) return { path: p, tried };
  return { path: null, tried };
}

function normAddr(a) {
  const s = String(a).toLowerCase().trim();
  return s.startsWith('0x') ? s : `0x${s}`;
}

function keypairFromEntry(entry) {
  if (typeof entry !== 'string') return null;
  if (entry.startsWith('suiprivkey')) return Ed25519Keypair.fromSecretKey(entry);
  const buf = Buffer.from(entry, 'base64');
  if (buf.length < 32) return null;
  return Ed25519Keypair.fromSecretKey(buf.subarray(0, 32));
}

function keypairFromEnv() {
  const raw = process.env.SUI_PRIVATE_KEY?.trim();
  if (!raw) return null;
  if (/^suiprivkey1/i.test(raw)) return Ed25519Keypair.fromSecretKey(raw);
  const hex = raw.replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return Ed25519Keypair.fromSecretKey(Buffer.from(hex, 'hex'));
  }
  throw new Error('SUI_PRIVATE_KEY must be 64 hex chars or suiprivkey1….');
}

async function resolveKeypair(client, adminCapId) {
  const res = await client.getObject({ id: adminCapId, options: { showOwner: true } });
  if (res.error || !res.data) throw new Error(`AdminCap unreachable: ${JSON.stringify(res)}`);
  const ownerAddr = res.data.owner?.AddressOwner;
  if (!ownerAddr) throw new Error(`Unexpected AdminCap owner: ${JSON.stringify(res.data.owner)}`);
  const need = normAddr(ownerAddr);

  const fromEnv = keypairFromEnv();
  if (fromEnv) {
    if (normAddr(fromEnv.toSuiAddress()) !== need) {
      throw new Error(`SUI_PRIVATE_KEY does not sign as AdminCap owner ${ownerAddr}`);
    }
    return fromEnv;
  }

  const { path: ks, tried } = resolveKeystorePath();
  if (!ks) throw new Error(`No keystore found. Tried: ${tried.join(', ')}`);
  const parsed = JSON.parse(readFileSync(ks, 'utf8'));
  const keys = Array.isArray(parsed) ? parsed : parsed.keys || [];
  for (const entry of keys) {
    try {
      const kp = keypairFromEntry(entry);
      if (kp && normAddr(kp.toSuiAddress()) === need) return kp;
    } catch {
      // skip bad entry
    }
  }
  throw new Error(`No keystore entry matches AdminCap owner ${ownerAddr}`);
}

function filterCircuits(circuits) {
  const only = process.env.SUI_REGISTER_ONLY?.trim();
  if (!only) return circuits;
  const ids = new Set(only.split(',').map((s) => parseInt(s.trim(), 10)));
  return circuits.filter((c) => ids.has(c.templateId));
}

async function main() {
  const packageId = process.env.SUI_PACKAGE_ID?.trim();
  const registryId = process.env.SUI_VERIFIER_REGISTRY_ID?.trim();
  const adminCapId = process.env.SUI_ADMIN_CAP_ID?.trim();
  const network = process.env.SUI_NETWORK?.trim() || 'mainnet';

  if (!packageId || !registryId || !adminCapId) {
    console.error('Missing env: SUI_PACKAGE_ID, SUI_VERIFIER_REGISTRY_ID, SUI_ADMIN_CAP_ID');
    process.exit(1);
  }

  const vkPath = join(REPO_ROOT, 'sui-groth16-verifier', 'vk_data.json');
  if (!existsSync(vkPath)) {
    console.error('Missing vk_data.json. Run: npm run sui:generate-vk');
    process.exit(1);
  }

  let circuits = JSON.parse(readFileSync(vkPath, 'utf8'));
  circuits = filterCircuits(circuits);

  const url = process.env.SUI_RPC_URL?.trim() || getFullnodeUrl(network);
  const client = new SuiClient({ url });
  const keypair = await resolveKeypair(client, adminCapId);

  console.log('Network:', network, 'RPC:', url);
  console.log('Signer (AdminCap owner):', keypair.toSuiAddress());
  console.log('Updating', circuits.length, 'circuit(s)...\n');

  for (const c of circuits) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::groth16_verifier::update_circuit`,
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
      options: { showEffects: true },
    });

    const st = result.effects?.status?.status;
    if (st !== 'success') {
      console.error('Failed:', c.name, result.effects?.status);
      process.exit(1);
    }
    console.log(`OK ${c.name} (id=${c.templateId}) digest=${result.digest}`);

    // Wait for finality before the next tx so the AdminCap's new version
    // propagates and we do not race on stale input objects.
    await client.waitForTransaction({ digest: result.digest });
  }

  console.log('\nDone. Retest with scripts/sui/test-verify.ts.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
