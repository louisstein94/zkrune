/**
 * Server-side Solana transaction verification utilities
 *
 * All functions operate on raw amounts (u64 base units) to avoid float rounding.
 * No fallback logic — every check either passes or throws a descriptive error.
 */

import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

// ─── SPL Token instruction discriminators ────────────────────────────────────
const SPL_IX = {
  TRANSFER: 3,
  BURN: 8,
  BURN_CHECKED: 9,
  TRANSFER_CHECKED: 12,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParsedTokenBalance {
  accountIndex: number;
  mint: string;
  uiTokenAmount: { amount: string; decimals: number; uiAmount: number | null };
}

/** A minimal shape covering both legacy and versioned transaction objects. */
export interface TxInfo {
  transaction: {
    message: {
      instructions: Array<{ programIdIndex: number; accountKeyIndexes?: number[]; accounts?: number[]; data: string | number[] }>;
      staticAccountKeys?: PublicKey[];
      accountKeys?: PublicKey[];
    };
  };
  meta: {
    err: unknown;
    preTokenBalances?: ParsedTokenBalance[];
    postTokenBalances?: ParsedTokenBalance[];
    innerInstructions?: Array<{ index: number; instructions: Array<{ programIdIndex: number; accountKeyIndexes?: number[]; accounts?: number[]; data: string | number[] }> }>;
  } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the flat account-key array from a legacy or versioned message. */
export function getTxAccountKeys(txInfo: TxInfo): PublicKey[] {
  const msg = txInfo.transaction.message;
  if ('staticAccountKeys' in msg && msg.staticAccountKeys) return msg.staticAccountKeys;
  if ('accountKeys' in msg && msg.accountKeys) return msg.accountKeys;
  throw new Error('Cannot extract account keys from transaction message');
}

/**
 * Decode an SPL instruction's raw data bytes.
 * Versioned transactions encode data as base58 strings; legacy as number arrays.
 */
export function decodeSplInstructionData(rawData: string | number[]): Uint8Array {
  if (typeof rawData === 'string') return bs58.decode(rawData);
  return new Uint8Array(rawData);
}

/** Get the account-index array from an instruction regardless of tx version. */
function getIxAccounts(ix: { accountKeyIndexes?: number[]; accounts?: number[] }): number[] {
  return ix.accountKeyIndexes ?? ix.accounts ?? [];
}

/**
 * Return the raw token balance (as BigInt) for a specific ATA index at pre or post state.
 * Throws if the ATA is not present in the balance list — no fallback.
 */
export function getRawTokenBalance(
  balances: ParsedTokenBalance[],
  ataIndex: number,
  mintAddress: string,
  label: string,
): bigint {
  const entry = balances.find(
    b => b.accountIndex === ataIndex && b.mint === mintAddress,
  );
  if (!entry) {
    throw new Error(`${label}: ATA at index ${ataIndex} for mint ${mintAddress} not found in token balances`);
  }
  return BigInt(entry.uiTokenAmount.amount);
}

/**
 * Compute how much raw tokens moved OUT of `sourceAtaIndex` and INTO `destAtaIndex`.
 * Returns { sourceDelta, destDelta } — both as positive BigInt values.
 * Throws if either ATA is missing.
 */
export function getTokenTransferDeltas(
  txInfo: TxInfo,
  sourceAtaIndex: number,
  destAtaIndex: number,
  mintAddress: string,
): { sourceDelta: bigint; destDelta: bigint } {
  const pre = txInfo.meta?.preTokenBalances ?? [];
  const post = txInfo.meta?.postTokenBalances ?? [];

  const sourcePre = getRawTokenBalance(pre, sourceAtaIndex, mintAddress, 'sourcePre');
  const sourcePost = getRawTokenBalance(post, sourceAtaIndex, mintAddress, 'sourcePost');
  const destPre = getRawTokenBalance(pre, destAtaIndex, mintAddress, 'destPre');
  const destPost = getRawTokenBalance(post, destAtaIndex, mintAddress, 'destPost');

  const sourceDelta = sourcePre - sourcePost; // tokens left the source
  const destDelta = destPost - destPre;       // tokens arrived at destination

  return { sourceDelta, destDelta };
}

/**
 * Compute how much raw tokens were burned from `ataIndex`.
 * A burn decreases the ATA balance and the mint supply; the ATA entry disappears or
 * goes to zero in postTokenBalances. We only require the pre entry to exist.
 */
export function getBurnDelta(
  txInfo: TxInfo,
  ataIndex: number,
  mintAddress: string,
): bigint {
  const pre = txInfo.meta?.preTokenBalances ?? [];
  const post = txInfo.meta?.postTokenBalances ?? [];

  const preBal = getRawTokenBalance(pre, ataIndex, mintAddress, 'burnPre');
  // After a full burn the account may be closed; treat missing post as 0
  const postEntry = post.find(b => b.accountIndex === ataIndex && b.mint === mintAddress);
  const postBal = postEntry ? BigInt(postEntry.uiTokenAmount.amount) : 0n;

  return preBal - postBal;
}

/**
 * Verify that at least one SPL Transfer (3) or TransferChecked (12) instruction
 * has `sourceAta` as source and `destAta` as destination.
 *
 * Account layout:
 *   Transfer(3):        [source, destination, authority, ...]
 *   TransferChecked(12):[source, mint,        destination, authority, ...]
 *
 * Throws if no matching instruction is found.
 */
export function verifySplTransferToDestination(
  txInfo: TxInfo,
  accountKeys: PublicKey[],
  sourceAta: PublicKey,
  destAta: PublicKey,
): void {
  const topLevel = txInfo.transaction.message.instructions ?? [];
  const inner = txInfo.meta?.innerInstructions?.flatMap(ii => ii.instructions) ?? [];

  const found = [...topLevel, ...inner].some(ix => {
    if (!accountKeys[ix.programIdIndex]?.equals(TOKEN_PROGRAM_ID)) return false;
    const data = decodeSplInstructionData(ix.data);
    const accs = getIxAccounts(ix);

    if (data[0] === SPL_IX.TRANSFER && accs.length >= 2) {
      return (
        accountKeys[accs[0]]?.equals(sourceAta) &&
        accountKeys[accs[1]]?.equals(destAta)
      );
    }
    if (data[0] === SPL_IX.TRANSFER_CHECKED && accs.length >= 3) {
      // TransferChecked: [source, mint, destination, authority]
      return (
        accountKeys[accs[0]]?.equals(sourceAta) &&
        accountKeys[accs[2]]?.equals(destAta)
      );
    }
    return false;
  });

  if (!found) {
    throw new Error(
      `No SPL Transfer instruction found with source=${sourceAta.toBase58()} → dest=${destAta.toBase58()}`,
    );
  }
}

/**
 * Verify that at least one SPL Burn (8) or BurnChecked (9) instruction
 * targets `walletAta` and references `mintPubkey`.
 *
 * Account layout:
 *   Burn(8):        [token_account, mint, authority, ...]
 *   BurnChecked(9): [token_account, mint, authority, ...]
 *
 * Optionally verifies that the authority is `walletPubkey`.
 * Throws if no matching instruction is found.
 */
export function verifySplBurnFromAta(
  txInfo: TxInfo,
  accountKeys: PublicKey[],
  walletAta: PublicKey,
  mintPubkey: PublicKey,
  walletPubkey: PublicKey,
): void {
  const topLevel = txInfo.transaction.message.instructions ?? [];
  const inner = txInfo.meta?.innerInstructions?.flatMap(ii => ii.instructions) ?? [];

  const found = [...topLevel, ...inner].some(ix => {
    if (!accountKeys[ix.programIdIndex]?.equals(TOKEN_PROGRAM_ID)) return false;
    const data = decodeSplInstructionData(ix.data);
    const accs = getIxAccounts(ix);

    if (
      (data[0] === SPL_IX.BURN || data[0] === SPL_IX.BURN_CHECKED) &&
      accs.length >= 3
    ) {
      const tokenAccount = accountKeys[accs[0]];
      const mint = accountKeys[accs[1]];
      const authority = accountKeys[accs[2]];
      return (
        tokenAccount?.equals(walletAta) &&
        mint?.equals(mintPubkey) &&
        authority?.equals(walletPubkey)
      );
    }
    return false;
  });

  if (!found) {
    throw new Error(
      `No SPL Burn instruction found for ATA=${walletAta.toBase58()} mint=${mintPubkey.toBase58()}`,
    );
  }
}

/**
 * Convert a UI-level token amount string to raw base units (BigInt), fully avoiding
 * floating-point arithmetic.
 *
 * "1234.567" with decimals=6 → 1234567000n
 * Accepts both number and string inputs; numbers are stringified before processing.
 */
export function toRawAmount(uiAmount: number | string, decimals: number): bigint {
  const str = typeof uiAmount === 'number' ? uiAmount.toFixed(decimals) : String(uiAmount);
  const [intPart, fracPart = ''] = str.split('.');
  // Pad or truncate the fractional part to exactly `decimals` digits
  const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intPart + paddedFrac);
}
