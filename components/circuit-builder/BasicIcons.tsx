// Premium SVG Icons for Basic Nodes

export function PrivateInputIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="11" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="url(#private-grad)" fillOpacity="0.2" />
      <path d="M9 11V7a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      <defs>
        <linearGradient id="private-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PublicInputIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="url(#public-grad)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
      <defs>
        <linearGradient id="public-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BooleanOutputIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="url(#bool-grad)" fillOpacity="0.1" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="bool-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function NumberOutputIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="url(#num-grad)" fillOpacity="0.1" />
      <path d="M10 8h4M12 8v8M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="num-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function getBasicIcon(type: string) {
  switch (type) {
    case 'private': return PrivateInputIcon;
    case 'public': return PublicInputIcon;
    case 'boolean': return BooleanOutputIcon;
    case 'number': return NumberOutputIcon;
    default: return PrivateInputIcon;
  }
}

