import { describe, it, expect } from 'vitest';
import {
  InMemoryNullifierStore,
  admitOnce,
  type NullifierStore,
} from '../lib/rwa/nullifiers';

// Public signal layout of rwa-eligibility:
// [nullifier, issuerAx, issuerAy, currentTime, requiredTier, jurisdictionRoot, policyId, sessionNonce]
const signals = (nullifier: string, policyId: string) => [
  nullifier, 'ax', 'ay', '1787000000', '2', 'root', policyId, 'nonce',
];

const OFFERING = '1001';
const INVESTOR = '55512345';

describe('one entry per investor', () => {
  it('admits a nullifier the offering has not seen', async () => {
    const store = new InMemoryNullifierStore();
    const result = await admitOnce(signals(INVESTOR, OFFERING), OFFERING, store);

    expect(result.admitted).toBe(true);
    expect(await store.size(OFFERING)).toBe(1);
  });

  it('refuses the same investor a second time', async () => {
    const store = new InMemoryNullifierStore();
    await admitOnce(signals(INVESTOR, OFFERING), OFFERING, store);
    const second = await admitOnce(signals(INVESTOR, OFFERING), OFFERING, store);

    expect(second.admitted).toBe(false);
    if (!second.admitted) expect(second.reason).toBe('already-admitted');
    expect(await store.size(OFFERING)).toBe(1);
  });

  it('keeps offerings independent', async () => {
    const store = new InMemoryNullifierStore();
    await admitOnce(signals(INVESTOR, OFFERING), OFFERING, store);

    // A different offering yields a different nullifier for the same investor,
    // and must not be blocked by the first.
    const other = await admitOnce(signals('99988877', '2002'), '2002', store);
    expect(other.admitted).toBe(true);
    expect(await store.size(OFFERING)).toBe(1);
    expect(await store.size('2002')).toBe(1);
  });

  it('reads the offering from the proof, not the caller', async () => {
    const store = new InMemoryNullifierStore();
    // A proof produced for 2002, presented at 1001.
    const result = await admitOnce(signals(INVESTOR, '2002'), OFFERING, store);

    expect(result.admitted).toBe(false);
    if (!result.admitted) expect(result.reason).toBe('wrong-offering');
    expect(await store.size(OFFERING)).toBe(0);
  });

  it('decides on the write, so concurrent attempts cannot both win', async () => {
    // add() is what decides, rather than a check followed by a write, because
    // the gap between the two is where a double admission gets in.
    const store = new InMemoryNullifierStore();
    const attempts = await Promise.all(
      Array.from({ length: 8 }, () =>
        admitOnce(signals(INVESTOR, OFFERING), OFFERING, store),
      ),
    );

    expect(attempts.filter((a) => a.admitted)).toHaveLength(1);
    expect(await store.size(OFFERING)).toBe(1);
  });

  it('works against any store implementing the interface', async () => {
    // The point of the interface: a compressed on-chain store swaps in here
    // without the caller changing.
    const backing = new Map<string, Set<string>>();
    const custom: NullifierStore = {
      async has(o, n) { return backing.get(o)?.has(n) ?? false; },
      async add(o, n) {
        const set = backing.get(o) ?? new Set();
        backing.set(o, set);
        if (set.has(n)) return false;
        set.add(n);
        return true;
      },
      async size(o) { return backing.get(o)?.size ?? 0; },
    };

    expect((await admitOnce(signals(INVESTOR, OFFERING), OFFERING, custom)).admitted).toBe(true);
    expect((await admitOnce(signals(INVESTOR, OFFERING), OFFERING, custom)).admitted).toBe(false);
  });
});
