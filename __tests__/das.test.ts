import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DAS_METHODS, isDasMethod, getAssetsByOwner, getAsset } from '../lib/solana/das';

// DAS is a Helius extension, not part of the Solana JSON-RPC surface. The
// behaviour worth pinning down is what happens when it is not configured:
// callers must get a clear "unavailable" rather than a request that goes to an
// endpoint which never implemented the method.

const OWNER = 'FjtRbndxKUsSX3y7bGhGYtRaWkd48HnyeLapi6jyBHB';

describe('DAS method identification', () => {
  it('recognises the methods the proxy forwards', () => {
    for (const method of DAS_METHODS) {
      expect(isDasMethod(method)).toBe(true);
    }
  });

  it('does not claim plain JSON-RPC methods', () => {
    for (const method of ['getBalance', 'getAccountInfo', 'sendTransaction']) {
      expect(isDasMethod(method)).toBe(false);
    }
  });
});

describe('DAS without a Helius credential', () => {
  const saved = { url: process.env.HELIUS_RPC_URL, key: process.env.HELIUS_API_KEY };

  beforeEach(() => {
    delete process.env.HELIUS_RPC_URL;
    delete process.env.HELIUS_API_KEY;
  });

  afterEach(() => {
    if (saved.url) process.env.HELIUS_RPC_URL = saved.url;
    if (saved.key) process.env.HELIUS_API_KEY = saved.key;
  });

  it('reports unavailable rather than calling out', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getAssetsByOwner(OWNER);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.unavailable).toBe(true);
      expect(result.reason).toContain('HELIUS_API_KEY');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe('DAS response handling', () => {
  const saved = process.env.HELIUS_RPC_URL;

  beforeEach(() => {
    process.env.HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=test';
  });

  afterEach(() => {
    if (saved) process.env.HELIUS_RPC_URL = saved;
    else delete process.env.HELIUS_RPC_URL;
    vi.restoreAllMocks();
  });

  it('normalises an asset into the fields a proof flow needs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 'zkrune-das',
          result: {
            id: 'MintAddress111',
            content: {
              metadata: { name: 'Test NFT', symbol: 'TST' },
              links: { image: 'https://example.test/i.png' },
            },
            grouping: [{ group_key: 'collection', group_value: 'Collection111' }],
            compression: { compressed: true },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getAsset('MintAddress111');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({
        id: 'MintAddress111',
        name: 'Test NFT',
        symbol: 'TST',
        collection: 'Collection111',
        compressed: true,
      });
    }
  });

  it('surfaces a DAS error instead of treating it as an empty result', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 'zkrune-das', error: { message: 'rate limited' } }),
        { status: 200 },
      ),
    );

    const result = await getAssetsByOwner(OWNER);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Not unavailable: the endpoint exists, the call failed.
      expect(result.unavailable).toBe(false);
      expect(result.reason).toBe('rate limited');
    }
  });

  it('returns an empty list rather than throwing when a wallet holds nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 'zkrune-das', result: { items: [], total: 0 } }),
        { status: 200 },
      ),
    );

    const result = await getAssetsByOwner(OWNER);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.assets).toEqual([]);
      expect(result.data.total).toBe(0);
    }
  });
});
