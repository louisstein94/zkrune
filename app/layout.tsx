import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
// Removed pop-ups for cleaner UX
// import InstallPrompt from "@/components/InstallPrompt";
// import FirstTimeSetupPrompt from "@/components/FirstTimeSetupPrompt";
// import TutorialOverlay from "@/components/TutorialOverlay";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";

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
  metadataBase: new URL('https://zkrune.com'),
  title: {
    default: "zkRune - Privacy Verification Infrastructure for Solana",
    template: "%s | zkRune"
  },
  description: "Embeddable zero-knowledge verification for access, eligibility, and identity. 100% client-side Groth16 proofs — secrets never leave the device.",
  icons: {
    icon: '/mobile-logo.png',
    apple: '/mobile-logo.png',
    shortcut: '/mobile-logo.png',
  },
  keywords: [
    "zkRune", "Zero-Knowledge", "ZK Proofs", "Solana", "Privacy", "Blockchain", 
    "Cryptography", "Groth16", "zk-SNARK", "Web3", "DeFi",
    "Privacy Verification", "Credential Verification", "Access Control",
    "Age Verification", "Membership Proof", "Privacy Infrastructure"
  ],
  authors: [{ name: "zkRune Team", url: "https://zkrune.com" }],
  creator: "zkRune Team",
  publisher: "zkRune",
  
  // OpenGraph
  openGraph: {
    title: "zkRune - Privacy Verification Infrastructure for Solana",
    description: "Embeddable zero-knowledge verification for access, eligibility, and identity. 13 production Groth16 circuits. 100% client-side — no server, no data leakage.",
    url: "https://zkrune.com",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'zkRune - Privacy Verification Infrastructure',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "zkRune - Privacy Verification Infrastructure",
    description: "Embeddable ZK verification for access and eligibility. 13 Groth16 circuits, 100% client-side. Secrets never leave the device.",
    creator: "@rune_zk",
    site: "@rune_zk",
    images: ['/og-image.png'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'Gakw8OYBkSTYP6AVrjS7g_q12C2m6fDf58ajgcm8Vdc',
    // yandex: 'your-yandex-code',
  },
  
  // PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'zkRune',
    startupImage: [
      '/mobile-logo.png',
    ],
  },
  applicationName: 'zkRune',
  
  // Additional
  category: 'Technology',
  alternates: {
    canonical: 'https://zkrune.com',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <body className="font-dm-sans antialiased">
        <ClientWalletProvider>
        {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}

