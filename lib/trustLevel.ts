export type TrustLevel = 'self-asserted' | 'peer-attested' | 'kyc-attested';

export interface TrustLevelMeta {
  level: TrustLevel;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: 'user' | 'users' | 'shield';
  tier: 0 | 1 | 2;
}

export const TRUST_LEVELS: Record<TrustLevel, TrustLevelMeta> = {
  'self-asserted': {
    level: 'self-asserted',
    label: 'Self-Asserted',
    shortLabel: 'Self',
    description: 'Proof inputs are provided by the user without external verification. Cryptographically valid but based on unverified claims.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/25',
    icon: 'user',
    tier: 0,
  },
  'peer-attested': {
    level: 'peer-attested',
    label: 'Peer-Attested',
    shortLabel: 'Peer',
    description: 'Proof inputs are vouched for by trusted peers in a decentralized network. Higher assurance than self-asserted.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/25',
    icon: 'users',
    tier: 1,
  },
  'kyc-attested': {
    level: 'kyc-attested',
    label: 'KYC-Attested',
    shortLabel: 'KYC',
    description: 'Proof inputs are verified by a trusted authority (KYC provider, government eID). Highest assurance — suitable for regulated use cases.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/25',
    icon: 'shield',
    tier: 2,
  },
};

export function getTrustLevel(level?: string): TrustLevelMeta {
  if (level && level in TRUST_LEVELS) {
    return TRUST_LEVELS[level as TrustLevel];
  }
  return TRUST_LEVELS['self-asserted'];
}
