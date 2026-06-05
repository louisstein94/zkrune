// Map of major EU / UK regulations to the zkRune circuits and
// integration paths that address them. Used by app/regulations/page.tsx
// to render the public compliance matrix.
//
// Editing rules:
// - Adding or removing a regulation = one entry in REGULATIONS.
// - All `mappedCircuits` entries must be valid CircuitId values
//   (lib/circuits.ts) — the type system enforces this.
// - Every entry should cite the specific article/section in
//   externalReference so a buyer can verify the framing themselves.
// - `lastReviewed` is bumped whenever the entry's substance changes,
//   not on cosmetic edits.

import type { CircuitId } from "./circuits";

export type RegulationStatus =
  | "binding"           // currently in force across the jurisdiction
  | "transposing"       // EU directive, member states in implementation window
  | "rolling-out"       // adopted, phased deployment
  | "in-draft";         // proposed, not yet final

export type RegulationCategory =
  | "Data Protection"
  | "Digital Platforms"
  | "AI Governance"
  | "Identity"
  | "Financial Services"
  | "Cybersecurity";

export type Jurisdiction =
  | "EU"
  | "EU+EEA"
  | "UK"
  | "EEA+UK"
  | "US"
  | "US-State";

export type IntegrationPath =
  | "SDK"
  | "Widget"
  | "Verify API"
  | "On-chain verifier";

export interface ExternalLink {
  label: string;
  href: string;
}

export interface Regulation {
  /** URL-safe slug, used for anchors and future per-regulation pages. */
  slug: string;
  /** Full official name. */
  name: string;
  /** Short label used in cards and badges. */
  shortName: string;
  category: RegulationCategory;
  status: RegulationStatus;
  jurisdiction: Jurisdiction;
  /** Plain-text date or "ongoing"; rendered as-is. */
  bindingDate: string;
  /** The compliance paradox in 1–2 sentences. */
  problem: string;
  /** How zkRune's architecture resolves it, in 1–2 sentences. */
  zkRuneFit: string;
  /** Circuits that directly support the named requirement. */
  mappedCircuits: CircuitId[];
  /** Integration surfaces relevant to this regulation. */
  integrationPaths: IntegrationPath[];
  /** Optional deeper landing on zkrune.com. */
  goesDeeper?: ExternalLink;
  /** Authoritative regulator / legal text reference. */
  externalReference: ExternalLink;
  /** ISO date of last substance review. */
  lastReviewed: string;
}

export const CATEGORY_ORDER: RegulationCategory[] = [
  "Identity",
  "AI Governance",
  "Digital Platforms",
  "Financial Services",
  "Cybersecurity",
  "Data Protection",
];

export const CATEGORY_BLURBS: Record<RegulationCategory, string> = {
  "Identity":
    "Selective disclosure of identity attributes — prove what's needed, reveal nothing else.",
  "AI Governance":
    "Cryptographic record-keeping for high-risk AI decisions, without retaining the raw inputs.",
  "Digital Platforms":
    "Age-appropriate design and content gating for platforms operating in the EU and UK.",
  "Financial Services":
    "Privacy-preserving KYC, solvency, and transaction-risk verification for regulated finance.",
  "Cybersecurity":
    "Operational resilience reporting and critical-infrastructure logging with zero PII retention.",
  "Data Protection":
    "Data-minimisation by architecture — proofs travel, personal data does not.",
};

export const STATUS_LABELS: Record<RegulationStatus, string> = {
  "binding": "Binding",
  "transposing": "Transposing",
  "rolling-out": "Rolling out",
  "in-draft": "In draft",
};

export const REGULATIONS: Regulation[] = [
  // ───────────── Identity ─────────────
  {
    slug: "eudi-wallet",
    name: "European Digital Identity Wallet (eIDAS 2.0)",
    shortName: "EUDI Wallet · eIDAS 2.0",
    category: "Identity",
    status: "rolling-out",
    jurisdiction: "EU+EEA",
    bindingDate: "Member-state wallets due 2026–2027",
    problem:
      "Every EU member state must issue a digital identity wallet supporting selective disclosure. A user proving residency, age, or a professional credential must do so without revealing unrelated attributes.",
    zkRuneFit:
      "Off-the-shelf circuits for age, membership, credential, and signature attestations — directly aligned with the Architecture Reference Framework's ZKP guidance. Drop into a wallet, attestation issuer, or relying-party verifier.",
    mappedCircuits: [
      "age-verification",
      "membership-proof",
      "credential-proof",
      "signature-verification",
      "range-proof",
    ],
    integrationPaths: ["SDK", "Verify API", "On-chain verifier"],
    goesDeeper: { label: "zkRune for EUDI Implementers", href: "/enterprise/eudi-wallet" },
    externalReference: {
      label: "EUDI ARF (European Commission)",
      href: "https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework",
    },
    lastReviewed: "2026-05-27",
  },

  // ───────────── AI Governance ─────────────
  {
    slug: "ai-act-article-12",
    name: "EU AI Act — Article 12 (record-keeping for high-risk AI)",
    shortName: "AI Act Art. 12",
    category: "AI Governance",
    status: "rolling-out",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding 2 August 2026",
    problem:
      "Article 12(4) mandates retention of every input that led to a match for at least six months. GDPR Article 5(1)(c) mandates data minimisation. The two binding obligations directly contradict each other for Annex III systems.",
    zkRuneFit:
      "Each decision becomes a tamper-evident Groth16 proof — fully verifiable by a market-surveillance authority, containing no raw input, under 200 bytes per record. Anchored on Solana / Ethereum / Sui mainnet.",
    mappedCircuits: [
      "hash-preimage",
      "signature-verification",
      "membership-proof",
      "patience-proof",
    ],
    integrationPaths: ["SDK", "Verify API", "On-chain verifier"],
    goesDeeper: { label: "Article 12 mapping", href: "/enterprise" },
    externalReference: {
      label: "Regulation (EU) 2024/1689 Art. 12",
      href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    },
    lastReviewed: "2026-05-27",
  },

  // ───────────── Digital Platforms ─────────────
  {
    slug: "dsa-article-28",
    name: "Digital Services Act — Article 28 (age-appropriate design)",
    shortName: "DSA Art. 28",
    category: "Digital Platforms",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding for VLOPs since Aug 2023; all platforms Feb 2024",
    problem:
      "Online platforms accessible to minors must implement appropriate measures to ensure a high level of privacy, safety, and security. Standard age-verification (collect government ID) is itself a GDPR liability and a breach target.",
    zkRuneFit:
      "Drop-in age proof generated in the user's browser. Your service receives only the cryptographic assertion that age >= threshold — never the underlying birthdate. Same widget covers UK Online Safety Act requirements.",
    mappedCircuits: ["age-verification", "range-proof"],
    integrationPaths: ["Widget", "SDK", "Verify API"],
    goesDeeper: { label: "zkRune for age-aware platforms", href: "/enterprise/age-gating" },
    externalReference: {
      label: "Regulation (EU) 2022/2065 Art. 28",
      href: "https://eur-lex.europa.eu/eli/reg/2022/2065/oj",
    },
    lastReviewed: "2026-05-27",
  },
  {
    slug: "uk-online-safety-act",
    name: "UK Online Safety Act — age verification duties",
    shortName: "UK OSA",
    category: "Digital Platforms",
    status: "binding",
    jurisdiction: "UK",
    bindingDate: "Phased enforcement from 2025; full age duty live",
    problem:
      "Ofcom enforcement is active and platforms are being named publicly for non-compliance. Storing government ID for age verification creates a parallel data-breach liability.",
    zkRuneFit:
      "Privacy-preserving age verification mapped to Ofcom's 'highly effective' criteria. No PII retained server-side; proof artefact is the audit record.",
    mappedCircuits: ["age-verification", "range-proof"],
    integrationPaths: ["Widget", "SDK"],
    goesDeeper: { label: "zkRune for age-aware platforms", href: "/enterprise/age-gating" },
    externalReference: {
      label: "Online Safety Act 2023 (UK)",
      href: "https://www.legislation.gov.uk/ukpga/2023/50/contents",
    },
    lastReviewed: "2026-05-27",
  },

  // ───────────── Financial Services ─────────────
  {
    slug: "mica",
    name: "Markets in Crypto-Assets Regulation (MiCA)",
    shortName: "MiCA",
    category: "Financial Services",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding since 30 June 2024 (CASPs since 30 Dec 2024)",
    problem:
      "Crypto-asset service providers must perform KYC, beneficial-ownership screening, and travel-rule disclosures while honouring GDPR data-minimisation. Exchanges currently retain identity dossiers indefinitely as a default.",
    zkRuneFit:
      "Proof of solvency, jurisdictional eligibility, and AML threshold compliance without retaining identity dossiers per customer. Composable with the existing balance-proof on-chain attestation path.",
    mappedCircuits: [
      "balance-proof",
      "whale-holder",
      "range-proof",
      "credential-proof",
      "signature-verification",
    ],
    integrationPaths: ["SDK", "Verify API", "On-chain verifier"],
    goesDeeper: { label: "zkRune for CASPs", href: "/enterprise/mica" },
    externalReference: {
      label: "Regulation (EU) 2023/1114",
      href: "https://eur-lex.europa.eu/eli/reg/2023/1114/oj",
    },
    lastReviewed: "2026-05-27",
  },
  {
    slug: "6amld",
    name: "Sixth Anti-Money Laundering Directive (6AMLD)",
    shortName: "6AMLD",
    category: "Financial Services",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Transposed since June 2021",
    problem:
      "Enhanced due diligence requires beneficial-ownership and PEP screening, but indefinite retention of EDD records is increasingly challenged under GDPR proportionality.",
    zkRuneFit:
      "Cryptographic proofs that a counter-party was screened against an authoritative list at a moment in time, without retaining the list lookup or the full identity attributes.",
    mappedCircuits: [
      "membership-proof",
      "credential-proof",
      "hash-preimage",
      "signature-verification",
    ],
    integrationPaths: ["SDK", "Verify API"],
    externalReference: {
      label: "Directive (EU) 2018/1673",
      href: "https://eur-lex.europa.eu/eli/dir/2018/1673/oj",
    },
    lastReviewed: "2026-05-27",
  },
  {
    slug: "dora",
    name: "Digital Operational Resilience Act (DORA)",
    shortName: "DORA",
    category: "Financial Services",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding since 17 January 2025",
    problem:
      "Financial entities and their ICT providers must report incidents and operational events with sufficient detail for regulators to assess systemic risk — without exposing customer data in shared incident reports.",
    zkRuneFit:
      "Cryptographic proofs of incident-relevant facts (event ordering, identity attestations, decision paths) that supervisors can independently verify without seeing the underlying customer records.",
    mappedCircuits: [
      "hash-preimage",
      "patience-proof",
      "signature-verification",
      "membership-proof",
    ],
    integrationPaths: ["SDK", "Verify API"],
    goesDeeper: { label: "zkRune for financial resilience", href: "/enterprise/dora" },
    externalReference: {
      label: "Regulation (EU) 2022/2554",
      href: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj",
    },
    lastReviewed: "2026-05-27",
  },
  {
    slug: "psd2-sca",
    name: "PSD2 — Strong Customer Authentication (SCA)",
    shortName: "PSD2 · SCA",
    category: "Financial Services",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding since 14 September 2019",
    problem:
      "Multi-factor authentication and transaction-risk analysis must be auditable, but the underlying behavioural and biometric signals are exactly the data buyers want minimised.",
    zkRuneFit:
      "Risk-attribute proofs (device binding, balance threshold, behavioural pattern membership) that satisfy SCA exemption criteria without retaining the raw signals.",
    mappedCircuits: ["signature-verification", "range-proof", "balance-proof"],
    integrationPaths: ["SDK", "Verify API"],
    externalReference: {
      label: "Directive (EU) 2015/2366 + RTS 2018/389",
      href: "https://eur-lex.europa.eu/eli/dir/2015/2366/oj",
    },
    lastReviewed: "2026-05-27",
  },

  // ───────────── Cybersecurity ─────────────
  {
    slug: "nis2",
    name: "NIS2 Directive (network and information security)",
    shortName: "NIS2",
    category: "Cybersecurity",
    status: "transposing",
    jurisdiction: "EU+EEA",
    bindingDate: "Member-state transposition deadline 17 October 2024 (ongoing)",
    problem:
      "Essential and important entities in critical sectors must report security events and demonstrate continuous risk management. Reporting templates require attribute-level detail that conflicts with data-minimisation.",
    zkRuneFit:
      "Cryptographic attestations of compliance actions (access controls, vendor audits, incident-response steps) verifiable by national CSIRTs without the entity exposing raw operational data.",
    mappedCircuits: [
      "signature-verification",
      "patience-proof",
      "membership-proof",
      "hash-preimage",
    ],
    integrationPaths: ["SDK", "Verify API"],
    goesDeeper: { label: "zkRune for financial resilience", href: "/enterprise/dora" },
    externalReference: {
      label: "Directive (EU) 2022/2555",
      href: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
    },
    lastReviewed: "2026-05-27",
  },

  // ───────────── Data Protection ─────────────
  {
    slug: "gdpr-article-5",
    name: "GDPR — Article 5(1)(c) data minimisation",
    shortName: "GDPR Art. 5(1)(c)",
    category: "Data Protection",
    status: "binding",
    jurisdiction: "EU+EEA",
    bindingDate: "Binding since 25 May 2018",
    problem:
      "Personal data must be adequate, relevant, and limited to what is necessary. Every other regulation in this list demands more logging, more retention, more attestation — pulling against this baseline.",
    zkRuneFit:
      "Privacy by architecture: proofs travel, personal data does not. Where every other vendor is solving the tension with policy, zkRune solves it structurally — there is no raw PII to delete because it was never collected server-side.",
    mappedCircuits: [
      "age-verification",
      "balance-proof",
      "membership-proof",
      "credential-proof",
      "hash-preimage",
    ],
    integrationPaths: ["Widget", "SDK", "Verify API", "On-chain verifier"],
    externalReference: {
      label: "Regulation (EU) 2016/679 Art. 5",
      href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    },
    lastReviewed: "2026-05-27",
  },
  {
    slug: "us-ccpa-cpra",
    name: "California Consumer Privacy Act (as amended by CPRA)",
    shortName: "CCPA / CPRA",
    category: "Data Protection",
    status: "binding",
    jurisdiction: "US-State",
    bindingDate: "CCPA binding since 1 January 2020; CPRA amendments since 1 January 2023",
    problem:
      "CPRA requires data collection to be reasonably necessary and proportionate to disclosed purposes, with consumer rights including deletion. The default architecture — collect all behavioural and demographic data, then implement rights workflows on top — creates a structural conflict that the CPPA is enforcing.",
    zkRuneFit:
      "Architectural data-minimisation: verify the threshold (age, residency, eligibility) without retaining the underlying personal data. Right-to-delete becomes structurally trivial because there is nothing to delete server-side.",
    mappedCircuits: [
      "age-verification",
      "range-proof",
      "membership-proof",
      "credential-proof",
    ],
    integrationPaths: ["Widget", "SDK", "Verify API"],
    goesDeeper: { label: "zkRune for US privacy", href: "/enterprise/us-privacy" },
    externalReference: {
      label: "California Civil Code § 1798.100 et seq.",
      href: "https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5",
    },
    lastReviewed: "2026-06-03",
  },
  {
    slug: "us-colorado-ai-act",
    name: "Colorado AI Act (SB 24-205)",
    shortName: "Colorado AI Act",
    category: "AI Governance",
    status: "rolling-out",
    jurisdiction: "US-State",
    bindingDate: "Binding 1 February 2026",
    problem:
      "First US state-level AI Act. Developers and deployers of high-risk AI systems must conduct impact assessments, provide consumer notice and an appeal right for adverse consequential decisions, and disclose AI-system use. Retention of decision-input data conflicts with state privacy law data-minimisation principles.",
    zkRuneFit:
      "Cryptographic commitment to each consequential AI decision; the impact assessment becomes a tamper-evident chain that the Colorado attorney general can re-verify. Cleanly composable with the Proof of Agent framework for agentic deployments.",
    mappedCircuits: [
      "hash-preimage",
      "signature-verification",
      "membership-proof",
      "patience-proof",
    ],
    integrationPaths: ["SDK", "Verify API"],
    goesDeeper: { label: "zkRune for US privacy", href: "/enterprise/us-privacy" },
    externalReference: {
      label: "Colorado SB 24-205",
      href: "https://leg.colorado.gov/bills/sb24-205",
    },
    lastReviewed: "2026-06-03",
  },
];

export function getRegulationsByCategory(): Record<RegulationCategory, Regulation[]> {
  const grouped = {} as Record<RegulationCategory, Regulation[]>;
  for (const cat of CATEGORY_ORDER) grouped[cat] = [];
  for (const reg of REGULATIONS) grouped[reg.category].push(reg);
  return grouped;
}
