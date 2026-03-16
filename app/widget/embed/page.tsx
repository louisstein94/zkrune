'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import Script from 'next/script';

type CircuitId = string;
type Theme = 'dark' | 'light';

function EmbedWidget() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const circuit = params.get('circuit') as CircuitId | null;
  const theme = (params.get('theme') ?? 'dark') as Theme;

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    const w = (window as any).ZkRuneWidget;
    if (!w) return;

    initRef.current = true;

    w.init({
      container: containerRef.current,
      circuit: circuit || undefined,
      theme,
      verifierUrl: '/api/verify-proof',
      circuitBaseUrl: '/circuits',
      buttonLabel: 'Verify with zkRune',
      onResult: (result: any) => {
        window.parent.postMessage(
          { type: 'zkrune-result', ...result },
          '*',
        );
      },
      onError: (error: any) => {
        window.parent.postMessage(
          { type: 'zkrune-error', ...error },
          '*',
        );
      },
    });
  }, [circuit, theme]);

  return (
    <>
      <Script
        src="/zkrune-widget.js"
        strategy="afterInteractive"
        onReady={() => {
          if (initRef.current || !containerRef.current) return;
          const w = (window as any).ZkRuneWidget;
          if (!w) return;

          initRef.current = true;

          w.init({
            container: containerRef.current,
            circuit: circuit || undefined,
            theme,
            verifierUrl: '/api/verify-proof',
            circuitBaseUrl: '/circuits',
            buttonLabel: 'Verify with zkRune',
            onResult: (result: any) => {
              window.parent.postMessage(
                { type: 'zkrune-result', ...result },
                '*',
              );
            },
            onError: (error: any) => {
              window.parent.postMessage(
                { type: 'zkrune-error', ...error },
                '*',
              );
            },
          });
        }}
      />
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 16,
        }}
      />
    </>
  );
}

export default function WidgetEmbedPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16, textAlign: 'center', color: '#888' }}>Loading...</div>}>
      <EmbedWidget />
    </Suspense>
  );
}
