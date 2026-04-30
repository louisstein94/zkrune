'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import '@solana/wallet-adapter-react-ui/styles.css';

// Cast around a known TS issue between @types/react@^18.3.28 and the
// @solana/wallet-adapter typings (FC return type widened to include
// Promise<ReactNode> in newer React typings).
const ConnectionProviderAny = ConnectionProvider as unknown as React.FC<any>;
const WalletProviderAny = WalletProvider as unknown as React.FC<any>;
const WalletModalProviderAny = WalletModalProvider as unknown as React.FC<any>;

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProviderAny endpoint={RPC_ENDPOINT} config={{ commitment: 'confirmed' }}>
      <WalletProviderAny wallets={wallets} autoConnect onError={(e: unknown) => console.error(e)}>
        <WalletModalProviderAny>{children}</WalletModalProviderAny>
      </WalletProviderAny>
    </ConnectionProviderAny>
  );
}
