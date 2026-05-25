'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  SolanaMobileWalletAdapter,
  createDefaultAuthorizationResultCache,
  createDefaultAddressSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter';

import '@solana/wallet-adapter-react-ui/styles.css';

// Cast around a known TS issue between @types/react@^18.3.28 and the
// @solana/wallet-adapter typings (FC return type widened to include
// Promise<ReactNode> in newer React typings).
const ConnectionProviderAny = ConnectionProvider as unknown as React.FC<any>;
const WalletProviderAny = WalletProvider as unknown as React.FC<any>;
const WalletModalProviderAny = WalletModalProvider as unknown as React.FC<any>;

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

// Optional WalletConnect project ID — when missing, the adapter is omitted
// (it requires a valid Reown / WalletConnect Cloud project to relay).
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const APP_IDENTITY = {
  name: 'Red Panda Whale Verifier',
  uri: typeof window !== 'undefined' ? window.location.origin : 'https://zkrune.com',
};

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => {
    const list: any[] = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

    // Mobile Wallet Adapter — picked up automatically on Android when the
    // user taps "Connect" inside Telegram's in-app browser and any MWA-
    // compatible wallet (Phantom, Solflare, Backpack mobile) is installed.
    try {
      list.push(
        new SolanaMobileWalletAdapter({
          addressSelector: createDefaultAddressSelector(),
          appIdentity: APP_IDENTITY,
          authorizationResultCache: createDefaultAuthorizationResultCache(),
          chain: 'solana:mainnet',
          onWalletNotFound: createDefaultWalletNotFoundHandler(),
        } as any),
      );
    } catch (err) {
      console.warn('[wallet] MWA adapter failed to initialise:', err);
    }

    // WalletConnect / Reown — works as a cross-platform fallback (QR pairing
    // on desktop, deeplink on mobile). Requires a project ID; we silently
    // skip when not configured rather than crash the page.
    if (WC_PROJECT_ID) {
      try {
        list.push(
          new WalletConnectWalletAdapter({
            network: WalletAdapterNetwork.Mainnet,
            options: {
              projectId: WC_PROJECT_ID,
              metadata: {
                name: APP_IDENTITY.name,
                description: 'Prove whale-tier RPD holding with a ZK proof.',
                url: APP_IDENTITY.uri,
                icons: [`${APP_IDENTITY.uri}/favicon.ico`],
              },
            },
          }),
        );
      } catch (err) {
        console.warn('[wallet] WalletConnect adapter failed to initialise:', err);
      }
    }

    return list;
  }, []);

  return (
    <ConnectionProviderAny endpoint={RPC_ENDPOINT} config={{ commitment: 'confirmed' }}>
      <WalletProviderAny wallets={wallets} autoConnect onError={(e: unknown) => console.error(e)}>
        <WalletModalProviderAny>{children}</WalletModalProviderAny>
      </WalletProviderAny>
    </ConnectionProviderAny>
  );
}
