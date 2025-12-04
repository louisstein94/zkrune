/**
 * SEO utilities and structured data
 */

import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/og-image.png',
    url = 'https://zkrune.com',
    type = 'website',
    author = 'zkRune Team',
  } = config;

  const fullTitle = title.includes('zkRune') ? title : `${title} | zkRune`;
  const fullUrl = url.startsWith('http') ? url : `https://zkrune.com${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://zkrune.com${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: 'zkRune',
    
    // OpenGraph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'zkRune',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@rune_zk',
      site: '@rune_zk',
      images: [fullImageUrl],
    },

    // Additional
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
      google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // other: 'your-other-verification-code',
    },

    // Canonical
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'zkRune',
    url: 'https://zkrune.com',
    logo: 'https://zkrune.com/mobile-logo.png',
    description: 'Visual Zero-Knowledge Proof Builder for Zcash. Create privacy-preserving applications without cryptography expertise.',
    sameAs: [
      'https://twitter.com/rune_zk',
      'https://github.com/louisstein94/zkrune',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Developer Relations',
      url: 'https://github.com/louisstein94/zkrune/issues',
    },
  };
}

/**
 * Generate JSON-LD structured data for software application
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'zkRune',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'Visual Zero-Knowledge Proof Builder for Zcash. Build privacy-preserving applications without cryptography expertise. 100% client-side proof generation.',
    screenshot: 'https://zkrune.com/screenshot.png',
    softwareVersion: '1.2.1',
    author: {
      '@type': 'Organization',
      name: 'zkRune Team',
    },
    downloadUrl: 'https://zkrune.com/install',
    featureList: [
      '13 production-ready ZK proof templates',
      'Visual circuit builder',
      'Client-side proof generation',
      'Zcash Groth16 integration',
      'NPM SDK and CLI tools',
    ],
  };
}

/**
 * Generate JSON-LD structured data for article/blog post
 */
export function generateArticleSchema(config: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: config.description,
    image: config.image || 'https://zkrune.com/og-image.png',
    datePublished: config.publishedTime,
    dateModified: config.modifiedTime || config.publishedTime,
    author: {
      '@type': 'Person',
      name: config.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'zkRune',
      logo: {
        '@type': 'ImageObject',
        url: 'https://zkrune.com/mobile-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url,
    },
  };
}

/**
 * Generate JSON-LD structured data for FAQ
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD structured data for HowTo
 */
export function generateHowToSchema(config: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    totalTime: config.totalTime || 'PT5M',
    step: config.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * SEO-friendly template titles and descriptions
 */
export const templateSEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  'age-verification': {
    title: 'Age Verification ZK Proof',
    description: 'Prove you are 18+ without revealing your exact age. Zero-knowledge age verification using Zcash Groth16.',
    keywords: ['age verification', 'zkproof', 'privacy', 'kyc', 'zcash'],
  },
  'balance-proof': {
    title: 'Balance Proof ZK Proof',
    description: 'Prove minimum balance without revealing exact amount. Privacy-preserving financial verification.',
    keywords: ['balance proof', 'financial privacy', 'zcash', 'defi'],
  },
  'membership-proof': {
    title: 'Membership Proof ZK Proof',
    description: 'Prove group membership without revealing identity. Anonymous access control with zero-knowledge proofs.',
    keywords: ['membership proof', 'access control', 'privacy', 'dao'],
  },
  'range-proof': {
    title: 'Range Proof ZK Proof',
    description: 'Prove value is within range without revealing exact number. Credit score and salary verification.',
    keywords: ['range proof', 'bulletproofs', 'privacy', 'zkp'],
  },
  'private-voting': {
    title: 'Private Voting ZK Proof',
    description: 'Anonymous voting with cryptographic proof. Secure DAO governance and elections.',
    keywords: ['private voting', 'dao', 'governance', 'zkproof'],
  },
  'hash-preimage': {
    title: 'Hash Preimage ZK Proof',
    description: 'Prove you know secret X where hash(X) = Y without revealing X. Cryptographic commitments.',
    keywords: ['hash preimage', 'commitment', 'cryptography', 'zkp'],
  },
  'credential-proof': {
    title: 'Credential Verification ZK Proof',
    description: 'Prove valid credentials without revealing data. Privacy-preserving KYC and license verification.',
    keywords: ['credentials', 'kyc', 'privacy', 'verification'],
  },
  'token-swap': {
    title: 'Token Swap ZK Proof',
    description: 'Prove sufficient balance for swap anonymously. Private DEX trading and P2P exchanges.',
    keywords: ['token swap', 'dex', 'defi', 'privacy'],
  },
  'signature-verification': {
    title: 'Signature Verification ZK Proof',
    description: 'Verify signatures without revealing private key. Secure message signing and authentication.',
    keywords: ['signature', 'authentication', 'cryptography', 'zkp'],
  },
  'patience-proof': {
    title: 'Patience Privacy Proof',
    description: 'Prove you waited a time period without revealing exact timing. Time-locked rewards and contests.',
    keywords: ['time lock', 'patience', 'privacy', 'zkproof'],
  },
  'quadratic-voting': {
    title: 'Quadratic Voting ZK Proof',
    description: 'Fair governance voting with quadratic token weighting. Prevent whale dominance in DAOs.',
    keywords: ['quadratic voting', 'dao', 'governance', 'fair voting'],
  },
  'nft-ownership': {
    title: 'NFT Ownership ZK Proof',
    description: 'Prove NFT ownership without revealing which NFT. Private access to exclusive communities.',
    keywords: ['nft', 'ownership proof', 'privacy', 'web3'],
  },
  'anonymous-reputation': {
    title: 'Anonymous Reputation ZK Proof',
    description: 'Prove reputation score without revealing identity. Anonymous credit systems and verification.',
    keywords: ['reputation', 'credit score', 'privacy', 'zkproof'],
  },
};

