import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { ZKRUNE_TOKEN, MARKETPLACE_CONFIG } from '@/lib/token/config';

export type PurchaseStage =
  | 'idle'
  | 'building-tx'
  | 'awaiting-signature'
  | 'confirming'
  | 'recording'
  | 'complete'
  | 'error';

type FeeDestination = 'reward_vault' | 'treasury' | 'split';

interface PurchaseState {
  stage: PurchaseStage;
  error: string | null;
  txSignature: string | null;
}

export function useMarketplacePurchase() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<PurchaseState>({
    stage: 'idle',
    error: null,
    txSignature: null,
  });

  const purchase = useCallback(async (
    templateId: string,
    creatorAddress: string,
    priceUi: number,
  ): Promise<{ success: boolean; txSignature?: string; error?: string }> => {
    if (!publicKey || !sendTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    setState({ stage: 'building-tx', error: null, txSignature: null });

    try {
      const mintPubkey = new PublicKey(ZKRUNE_TOKEN.MINT_ADDRESS);
      const creatorPubkey = new PublicKey(creatorAddress);
      const decimals = ZKRUNE_TOKEN.DECIMALS;

      const rawTotal = BigInt(Math.round(priceUi * 10 ** decimals));
      const platformFeeBps = MARKETPLACE_CONFIG.PLATFORM_FEE;
      const rawPlatformFee = (rawTotal * BigInt(platformFeeBps)) / 100n;
      const rawCreatorAmount = rawTotal - rawPlatformFee;

      const buyerAta = getAssociatedTokenAddressSync(mintPubkey, publicKey);
      const creatorAta = getAssociatedTokenAddressSync(mintPubkey, creatorPubkey);

      const tx = new Transaction();

      tx.add(
        createTransferInstruction(
          buyerAta,
          creatorAta,
          publicKey,
          rawCreatorAmount,
        ),
      );

      if (rawPlatformFee > 0n) {
        const rewardShare = MARKETPLACE_CONFIG.REWARD_POOL_SHARE;
        const rawToRewardVault = (rawPlatformFee * BigInt(rewardShare)) / 100n;
        const rawToTreasury = rawPlatformFee - rawToRewardVault;

        if (rawToRewardVault > 0n && ZKRUNE_TOKEN.REWARD_VAULT_ADDRESS) {
          const rewardVaultPubkey = new PublicKey(ZKRUNE_TOKEN.REWARD_VAULT_ADDRESS);
          tx.add(
            createTransferInstruction(
              buyerAta,
              rewardVaultPubkey,
              publicKey,
              rawToRewardVault,
            ),
          );
        }

        if (rawToTreasury > 0n && ZKRUNE_TOKEN.TREASURY_ADDRESS) {
          const treasuryPubkey = new PublicKey(ZKRUNE_TOKEN.TREASURY_ADDRESS);
          const treasuryAta = getAssociatedTokenAddressSync(mintPubkey, treasuryPubkey);
          tx.add(
            createTransferInstruction(
              buyerAta,
              treasuryAta,
              publicKey,
              rawToTreasury,
            ),
          );
        }
      }

      setState(s => ({ ...s, stage: 'awaiting-signature' }));

      const txSignature = await sendTransaction(tx, connection);

      setState(s => ({ ...s, stage: 'confirming', txSignature }));

      await connection.confirmTransaction(txSignature, 'confirmed');

      setState(s => ({ ...s, stage: 'recording' }));

      const res = await fetch('/api/marketplace/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          buyerAddress: publicKey.toBase58(),
          transactionSignature: txSignature,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setState({ stage: 'error', error: data.error, txSignature });
        return { success: false, error: data.error, txSignature };
      }

      setState({ stage: 'complete', error: null, txSignature });
      return { success: true, txSignature };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setState({ stage: 'error', error: message, txSignature: null });
      return { success: false, error: message };
    }
  }, [publicKey, sendTransaction, connection]);

  const reset = useCallback(() => {
    setState({ stage: 'idle', error: null, txSignature: null });
  }, []);

  return { ...state, purchase, reset };
}
