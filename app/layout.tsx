import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

// Using Playfair Display as fallback for PP Hatton (similar elegant serif)
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-hatton",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "zkRune - Build Privacy Without Code",
  description: "Visual Zero-Knowledge Proof Builder for Zcash. Create privacy-preserving applications without cryptography expertise.",
  icons: {
    icon: '/mobile-logo.png',
    apple: '/mobile-logo.png',
  },
  keywords: ["zkRune", "Zero-Knowledge", "ZK Proofs", "Zcash", "Privacy", "Blockchain", "Cryptography"],
  authors: [{ name: "zkRune Team" }],
  openGraph: {
    title: "zkRune - Build Privacy Without Code",
    description: "Visual Zero-Knowledge Proof Builder for Zcash",
    url: "https://zkrune.com",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune - Build Privacy Without Code",
    description: "Visual Zero-Knowledge Proof Builder for Zcash",
    creator: "@rune_zk",
    site: "@rune_zk",
  },
  // PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'zkRune',
  },
  applicationName: 'zkRune',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <body className="font-dm-sans antialiased">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}

