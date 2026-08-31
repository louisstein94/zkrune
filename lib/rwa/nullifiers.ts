/**
 * One entry per investor, per offering.
 *
 * The circuit publishes a nullifier that is deterministic for an investor in a
 * given offering and unlinkable to the same investor anywhere else. That makes
 * a repeat attempt recognisable — but only to a venue that remembers what it
 * has already seen. Nothing in a proof prevents its holder from presenting a
 * second one.
 *
 * The audit trail reports repeats after the fact. This refuses them at the
 * door, which is the difference between noticing an over-subscription and
 * preventing it.
 *
 * WHERE THE SET LIVES MATTERS. The store is deliberately an interface:
 *
 *   in memory   fine for a demo or a single short-lived process. A venue
 *               running two instances gets no protection at all, and a restart
 *               forgets everything.
 *
 *   on chain    what makes the guarantee survive restarts and hold across
 *               instances, and what lets anyone check the venue enforced it.
 *               A regular Solana account per nullifier carries rent that an
 *               offering with real subscriber numbers would feel, which is
 *               what ZK Compression exists to solve: state committed to a
 *               Merkle tree with only the root on chain. That backing slots in
 *               behind this interface without the callers changing.
 */

export interface NullifierStore {
  /** Whether this nullifier has already been admitted to this offering. */
  has(offering: string, nullifier: string): Promise<boolean>;
  /**
   * Records a nullifier. Returns false when it was already present, so a
   * caller can rely on the return value rather than checking first — the gap
   * between a separate check and write is where a double admission gets in.
   */
  add(offering: string, nullifier: string): Promise<boolean>;
  /** Admissions recorded for an offering. */
  size(offering: string): Promise<number>;
}

/**
 * Process-local store.
 *
 * Suitable for demos, tests and a single-process gate. Not suitable for a
 * venue that runs more than one instance or expects to survive a restart —
 * both cases silently lose the guarantee, so the limitation is named here
 * rather than discovered later.
 */
export class InMemoryNullifierStore implements NullifierStore {
  private readonly seen = new Map<string, Set<string>>();

  private setFor(offering: string): Set<string> {
    let set = this.seen.get(offering);
    if (!set) {
      set = new Set();
      this.seen.set(offering, set);
    }
    return set;
  }

  async has(offering: string, nullifier: string): Promise<boolean> {
    return this.setFor(offering).has(nullifier);
  }

  async add(offering: string, nullifier: string): Promise<boolean> {
    const set = this.setFor(offering);
    if (set.has(nullifier)) return false;
    set.add(nullifier);
    return true;
  }

  async size(offering: string): Promise<number> {
    return this.setFor(offering).size;
  }
}

export type AdmissionOutcome =
  | { admitted: true; nullifier: string }
  | { admitted: false; reason: 'already-admitted' | 'wrong-offering'; nullifier: string };

const SIGNAL_NULLIFIER = 0;
const SIGNAL_POLICY_ID = 6;

/**
 * Admits a proof once.
 *
 * The offering is read from the proof's own public signals rather than taken
 * from the caller, so a proof produced for one offering cannot be presented at
 * another by relabelling it.
 *
 * Verification is the caller's job and has to happen first: this decides
 * whether an already-valid proof is a repeat, and says nothing about whether
 * the proof was valid.
 */
export async function admitOnce(
  publicSignals: string[],
  offering: string,
  store: NullifierStore,
): Promise<AdmissionOutcome> {
  const nullifier = publicSignals[SIGNAL_NULLIFIER];

  if (publicSignals[SIGNAL_POLICY_ID] !== offering) {
    return { admitted: false, reason: 'wrong-offering', nullifier };
  }

  const fresh = await store.add(offering, nullifier);
  return fresh
    ? { admitted: true, nullifier }
    : { admitted: false, reason: 'already-admitted', nullifier };
}
