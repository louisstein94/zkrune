'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const ZKRUNE_MINT = process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump';
const CACHE_TTL = 30_000; // 30 seconds

interface AttestationResult {
  balance: string;
  mintAddress: string;
  decimals: number;
  symbol: string;
  attestedAt: number;
  signature: string;
}

interface UseBalanceAttestationReturn {
  balance: string | null;
  decimals: number;
  symbol: string;
  loading: boolean;
  error: string | null;
  attested: boolean;
  attestation: AttestationResult | null;
  mintAddress: string;
  setMintAddress: (addr: string) => void;
  refetch: () => void;
  walletConnected: boolean;
}

export function useBalanceAttestation(initialMint?: string): UseBalanceAttestationReturn {
  const { publicKey, connected } = useWallet();
  const [mintAddress, setMintAddress] = useState(initialMint || ZKRUNE_MINT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<AttestationResult | null>(null);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchAttestation = useCallback(async () => {
    if (!publicKey || !connected) {
      setAttestation(null);
      return;
    }

    if (Date.now() - lastFetch < CACHE_TTL && attestation) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/balance-attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          mintAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setAttestation(data);
        setLastFetch(Date.now());
      } else {
        throw new Error(data.error || 'Attestation failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(msg);
      setAttestation(null);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, mintAddress, lastFetch, attestation]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchAttestation();
    } else {
      setAttestation(null);
      setError(null);
    }
  }, [connected, publicKey, mintAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    setLastFetch(0);
    fetchAttestation();
  }, [fetchAttestation]);

  const humanBalance = attestation
    ? (Number(attestation.balance) / Math.pow(10, attestation.decimals)).toString()
    : null;

  return {
    balance: humanBalance,
    decimals: attestation?.decimals ?? 6,
    symbol: attestation?.symbol ?? 'zkRUNE',
    loading,
    error,
    attested: !!attestation,
    attestation,
    mintAddress,
    setMintAddress: (addr: string) => {
      setMintAddress(addr);
      setAttestation(null);
      setLastFetch(0);
    },
    refetch,
    walletConnected: connected && !!publicKey,
  };
}
