import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import FirstTimeSetupPrompt from "@/components/FirstTimeSetupPrompt";
import TutorialOverlay from "@/components/TutorialOverlay";
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
    default: "zkRune - Build Privacy Without Code",
    template: "%s | zkRune"
  },
  description: "Visual Zero-Knowledge Proof Builder for Zcash. Create privacy-preserving applications without cryptography expertise. 100% client-side proof generation with real Groth16 zk-SNARKs.",
  icons: {
    icon: '/mobile-logo.png',
    apple: '/mobile-logo.png',
    shortcut: '/mobile-logo.png',
  },
  keywords: [
    "zkRune", "Zero-Knowledge", "ZK Proofs", "Zcash", "Privacy", "Blockchain", 
    "Cryptography", "Groth16", "zk-SNARK", "Circuit Builder", "Web3", "DeFi",
    "Private Voting", "Credential Verification", "Anonymous Reputation"
  ],
  authors: [{ name: "zkRune Team", url: "https://zkrune.com" }],
  creator: "zkRune Team",
  publisher: "zkRune",
  
  // OpenGraph
  openGraph: {
    title: "zkRune - Build Privacy Without Code",
    description: "Visual Zero-Knowledge Proof Builder for Zcash. 13 production-ready templates. 100% client-side. Build privacy apps in hours, not months.",
    url: "https://zkrune.com",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'zkRune - Visual Zero-Knowledge Proof Builder',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "zkRune - Build Privacy Without Code",
    description: "Visual ZK Proof Builder for Zcash. 13 templates. 100% client-side. Build privacy apps fast.",
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  
  // Additional
  category: 'Technology',
  alternates: {
    canonical: 'https://zkrune.com',
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
        <ClientWalletProvider>
        {children}
        <InstallPrompt />
        <FirstTimeSetupPrompt />
        <TutorialOverlay />
        </ClientWalletProvider>
      </body>
    </html>
  );
}

