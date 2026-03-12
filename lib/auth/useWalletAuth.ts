/**
 * Client-side wallet auth utility
 *
 * Produces a signed payload that the server verifies with verifyAuth().
 *
 * Message format (canonical):
 *   zkrune:<action>:<wallet>:<field1=val1>&<field2=val2>:<timestampMs>
 *
 * Fields are sorted alphabetically to produce a deterministic string.
 * This binds the signature to the exact request parameters, preventing
 * reuse of a valid signature for a different proposal, amount, etc.
 */

import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { buildCanonicalMessage } from './verifyWalletSignature';

export interface SignedPayload {
  signedMessage: string;
  signature: string;
}

export function useWalletAuth() {
  const { publicKey, signMessage } = useWallet();

  /**
   * Signs a canonical message that binds action + wallet + all request fields.
   * `fields` must contain every critical parameter of the API request.
   */
  const buildSignedPayload = async (
    action: string,
    fields: Record<string, string | number>,
  ): Promise<SignedPayload> => {
    if (!signMessage) {
      throw new Error('Connected wallet does not support message signing');
    }
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const wallet = publicKey.toBase58();
    const timestamp = Date.now();
    const signedMessage = buildCanonicalMessage(action, wallet, fields, timestamp);
    const messageBytes = new TextEncoder().encode(signedMessage);
    const signatureBytes = await signMessage(messageBytes);
    const signature = bs58.encode(signatureBytes);

    return { signedMessage, signature };
  };

  return { buildSignedPayload };
}
