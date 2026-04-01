'use client';

import { getTrustLevel, type TrustLevel } from '@/lib/trustLevel';

const icons = {
  user: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  users: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  shield: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

interface TrustLevelBadgeProps {
  level?: TrustLevel | string;
  size?: 'sm' | 'md';
  showDescription?: boolean;
}

export default function TrustLevelBadge({ level, size = 'md', showDescription = false }: TrustLevelBadgeProps) {
  const meta = getTrustLevel(level);

  const tierDots = Array.from({ length: 3 }, (_, i) => (
    <span
      key={i}
      className={`w-1.5 h-1.5 rounded-full ${i <= meta.tier ? meta.color.replace('text-', 'bg-') : 'bg-zinc-700'}`}
    />
  ));

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${meta.bgColor} ${meta.borderColor} border ${meta.color}`}>
        {icons[meta.icon]}
        {meta.shortLabel}
      </span>
    );
  }

  return (
    <div className={`${meta.bgColor} ${meta.borderColor} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={meta.color}>{icons[meta.icon]}</span>
          <span className={`text-sm font-medium ${meta.color}`}>Trust Level: {meta.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {tierDots}
        </div>
      </div>
      {showDescription && (
        <p className="text-zinc-500 text-xs leading-relaxed">{meta.description}</p>
      )}
    </div>
  );
}
