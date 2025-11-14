// Premium SVG Icons for Advanced Operations

export function RangeCheckIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="17" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M7 12H17" stroke="url(#range-grad)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="range-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HashIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8H20M4 16H20M8 4V20M16 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" stroke="url(#hash-grad)" strokeWidth="1" opacity="0.3" />
      <defs>
        <linearGradient id="hash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ConditionalIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 9L12 15L20 9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="url(#cond-grad)" fillOpacity="0.2" />
      <path d="M4 15L12 21L20 15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="cond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MerkleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="4" r="2" fill="currentColor" />
      <circle cx="6" cy="10" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="10" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="3" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="9" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="15" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="21" cy="16" r="2" fill="currentColor" opacity="0.5" />
      <path d="M12 6L6 10M12 6L18 10M6 10L3 16M6 10L9 16M18 10L15 16M18 10L21 16" stroke="url(#merkle-grad)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="merkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ModuloIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M12 8V16M8 12H16" stroke="url(#mod-grad)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
      <defs>
        <linearGradient id="mod-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function getAdvancedIcon(operation: string) {
  switch (operation) {
    case 'range-check': return RangeCheckIcon;
    case 'hash': return HashIcon;
    case 'conditional': return ConditionalIcon;
    case 'merkle-proof': return MerkleIcon;
    case 'modulo': return ModuloIcon;
    default: return HashIcon;
  }
}

