export function AgeVerificationIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary" />
      <path d="M12 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-secondary opacity-60" />
      <circle cx="12" cy="12" r="10" stroke="url(#age-gradient)" strokeWidth="1" opacity="0.3" />
      <defs>
        <linearGradient id="age-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BalanceIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-zk-primary" />
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-zk-primary" />
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-zk-secondary opacity-60" />
      <circle cx="12" cy="12" r="10" stroke="url(#balance-gradient)" strokeWidth="1" opacity="0.2" />
      <defs>
        <linearGradient id="balance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MembershipIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" className="text-zk-secondary opacity-60" />
      <circle cx="7" cy="15" r="1.5" fill="currentColor" className="text-zk-primary" />
      <path d="M11 15H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary opacity-40" />
      <circle cx="12" cy="12" r="11" stroke="url(#member-gradient)" strokeWidth="0.5" opacity="0.2" />
      <defs>
        <linearGradient id="member-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RangeIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary" />
      <circle cx="8" cy="12" r="2" fill="currentColor" className="text-zk-primary" />
      <circle cx="16" cy="12" r="2" fill="currentColor" className="text-zk-secondary" />
      <path d="M8 12H16" stroke="url(#range-gradient)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 8L8 12L5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zk-primary opacity-40" />
      <path d="M19 8L16 12L19 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zk-secondary opacity-40" />
      <defs>
        <linearGradient id="range-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VotingIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-secondary opacity-40" />
      <path d="M8 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-secondary opacity-40" />
      <path d="M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-secondary opacity-40" />
      <circle cx="17" cy="17" r="4" fill="currentColor" className="text-zk-primary opacity-20" />
      <path d="M15.5 17L16.5 18L18.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zk-primary" />
      <defs>
        <linearGradient id="vote-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

