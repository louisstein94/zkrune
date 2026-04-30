import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ClientWalletProvider from '@/components/ClientWalletProvider';

export const metadata: Metadata = {
  title: 'Red Panda Whale Verification',
  description: 'Prove you are a Red Panda whale holder with a Groth16 ZK proof. No address or balance disclosed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Telegram WebApp SDK — required for Mini App APIs */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
