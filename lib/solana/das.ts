/**
 * Helius Digital Asset Standard (DAS) queries.
 *
 * DAS answers the question a proof flow actually starts with — what does this
 * wallet hold? — in one call. The plain JSON-RPC route to the same answer is
 * getProgramAccounts, which public endpoints rate-limit or refuse outright,
 * and which returns raw accounts the caller then has to decode.
 *
 * DAS is a Helius extension rather than part of the Solana JSON-RPC surface,
 * so it is only available when a Helius credential is configured. Callers get
 * an explicit `unavailable` result in that case instead of a confusing error
 * from an endpoint that never implemented the method.
 */

import { getHeliusRpcUrl } from '../solanaRpc';

/** DAS methods this codebase uses. Kept in one place so the RPC proxy can mirror it. */
export const DAS_METHODS = [
  'getAsset',
  'getAssetsByOwner',
  'getAssetsByGroup',
  'getAssetsByCreator',
  'getTokenAccounts',
  'searchAssets',
] as const;

export type DasMethod = (typeof DAS_METHODS)[number];

export function isDasMethod(method: string): method is DasMethod {
  return (DAS_METHODS as readonly string[]).includes(method);
}

export interface DasAsset {
  id: string;
  name: string | null;
  symbol: string | null;
  image: string | null;
  /** Collection address, when the asset belongs to one. */
  collection: string | null;
  /** Present for fungible assets. */
  balance: string | null;
  decimals: number | null;
  compressed: boolean;
}

export type DasResult<T> =
  | { ok: true; data: T }
  | { ok: false; unavailable: true; reason: string }
  | { ok: false; unavailable: false; reason: string };

function unavailable(reason: string): DasResult<never> {
  return { ok: false, unavailable: true, reason };
}

async function callDas<T>(method: DasMethod, params: unknown): Promise<DasResult<T>> {
  const endpoint = getHeliusRpcUrl();
  if (!endpoint) {
    return unavailable(
      'DAS requires a Helius endpoint. Set HELIUS_API_KEY or HELIUS_RPC_URL.',
    );
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'zkrune-das', method, params }),
    });
  } catch (e) {
    return { ok: false, unavailable: false, reason: e instanceof Error ? e.message : 'network error' };
  }

  if (!response.ok) {
    return { ok: false, unavailable: false, reason: `DAS responded ${response.status}` };
  }

  const body = (await response.json()) as { result?: T; error?: { message?: string } };
  if (body.error) {
    return { ok: false, unavailable: false, reason: body.error.message ?? 'DAS error' };
  }
  if (body.result === undefined) {
    return { ok: false, unavailable: false, reason: 'DAS returned no result' };
  }
  return { ok: true, data: body.result };
}

/** The subset of a DAS asset this codebase reads. DAS returns considerably more. */
interface RawDasAsset {
  id?: string;
  content?: {
    metadata?: { name?: string; symbol?: string };
    links?: { image?: string };
    files?: { uri?: string }[];
  };
  grouping?: { group_key?: string; group_value?: string }[];
  token_info?: { symbol?: string; balance?: number | string; decimals?: number };
  compression?: { compressed?: boolean };
}

function normalise(raw: RawDasAsset): DasAsset {
  const meta = raw.content?.metadata ?? {};
  const files = raw.content?.files ?? [];
  const collection = (raw.grouping ?? []).find((g) => g.group_key === 'collection');
  const info = raw.token_info ?? {};

  return {
    id: String(raw.id ?? ''),
    name: meta.name ?? null,
    symbol: meta.symbol ?? info.symbol ?? null,
    image: raw.content?.links?.image ?? files[0]?.uri ?? null,
    collection: collection?.group_value ?? null,
    balance: info.balance !== undefined ? String(info.balance) : null,
    decimals: typeof info.decimals === 'number' ? info.decimals : null,
    compressed: Boolean(raw.compression?.compressed),
  };
}

export interface OwnedAssetsOptions {
  /** 1-indexed. DAS paginates. */
  page?: number;
  /** Capped at 1000 by the API. */
  limit?: number;
  /** Include fungible tokens alongside NFTs. Off by default: NFT flows rarely want them. */
  includeFungible?: boolean;
}

/** Everything a wallet holds, normalised to the fields a proof flow needs. */
export async function getAssetsByOwner(
  owner: string,
  options: OwnedAssetsOptions = {},
): Promise<DasResult<{ assets: DasAsset[]; total: number }>> {
  const result = await callDas<{ items: RawDasAsset[]; total: number }>('getAssetsByOwner', {
    ownerAddress: owner,
    page: options.page ?? 1,
    limit: Math.min(options.limit ?? 100, 1000),
    displayOptions: {
      showFungible: options.includeFungible ?? false,
      showCollectionMetadata: true,
    },
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: {
      assets: (result.data.items ?? []).map(normalise),
      total: result.data.total ?? 0,
    },
  };
}

/** One asset by mint. Useful for confirming a mint exists before proving against it. */
export async function getAsset(id: string): Promise<DasResult<DasAsset>> {
  const result = await callDas<RawDasAsset>('getAsset', { id });
  if (!result.ok) return result;
  return { ok: true, data: normalise(result.data) };
}

/**
 * Whether a wallet holds an asset from a collection.
 *
 * This is a convenience for pre-filling a proof form, not a substitute for the
 * proof. It tells the interface what to offer; the circuit is what establishes
 * the claim, and the caller is trusted for neither.
 */
export async function holdsFromCollection(
  owner: string,
  collection: string,
): Promise<DasResult<{ holds: boolean; assets: DasAsset[] }>> {
  const result = await callDas<{ items: RawDasAsset[] }>('searchAssets', {
    ownerAddress: owner,
    grouping: ['collection', collection],
    page: 1,
    limit: 100,
  });

  if (!result.ok) return result;
  const assets = (result.data.items ?? []).map(normalise);
  return { ok: true, data: { holds: assets.length > 0, assets } };
}
