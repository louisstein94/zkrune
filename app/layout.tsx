import type { Metadata } from "next";
import { headers } from "next/headers";
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
    default: "zkRune — Privacy-Preserving Eligibility Infrastructure",
    template: "%s | zkRune"
  },
  description: "Prove eligibility without revealing the underlying data. Zero-knowledge verification for age, membership, balance and issuer-attested credentials — the compliance layer for tokenized assets on Solana. 14 production circuits. SDK, widget, or hosted API.",
  icons: {
    icon: '/mobile-logo.png',
    apple: '/mobile-logo.png',
    shortcut: '/mobile-logo.png',
  },
  keywords: [
    "zkRune", "Zero-Knowledge Verification", "ZK Proofs", "Privacy Infrastructure",
    "Age Verification API", "Age Gating", "Membership Proof", "Credential Verification",
    "Privacy Compliance", "GDPR", "EU AI Act", "UK Online Safety Act",
    "Groth16", "zk-SNARK", "Privacy-Preserving Authentication",
    "Anonymous Verification", "Eligibility Verification", "Access Control",
    "Solana", "Ethereum", "Base", "Sui"
  ],
  authors: [{ name: "zkRune Team", url: "https://zkrune.com" }],
  creator: "zkRune Team",
  publisher: "zkRune",

  // OpenGraph
  openGraph: {
    title: "zkRune — Privacy-Preserving Eligibility Infrastructure",
    description: "Prove eligibility without revealing the underlying data. Zero-knowledge verification for age, membership, balance and issuer-attested credentials — the compliance layer for tokenized assets on Solana. 14 production circuits. SDK, widget, or hosted API.",
    url: "https://zkrune.com",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'zkRune — Privacy-Preserving Verification Infrastructure',
      }
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "zkRune — Privacy-Preserving Eligibility Infrastructure",
    description: "Prove eligibility without revealing the data behind it. Zero-knowledge verification for age, membership, balance and issuer-attested credentials. 14 production circuits.",
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
  manifest: '/manifest.webmanifest',
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
  // Read the per-request nonce middleware set on `x-nonce`. Reading any
  // request header here forces dynamic rendering of every page under this
  // layout, which is what makes Next.js attach the nonce to its bootstrap
  // <script> tags. Without this, pages get statically pre-rendered at
  // build time and the script tags ship with no `nonce=` attribute; the
  // CSP `'strict-dynamic'` directive then blocks every chunk, leaving the
  // site with no client-side JS at all (no hydration, no event handlers,
  // every interactive element dead).
  headers();

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

