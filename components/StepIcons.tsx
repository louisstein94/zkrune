export function ChooseIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M8 8H16M8 12H14M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary opacity-60" />
      <circle cx="18" cy="6" r="3" fill="url(#choose-gradient)" />
      <path d="M16.5 6L17.5 7L19.5 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="choose-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GenerateIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="url(#generate-gradient)" strokeWidth="1.5" strokeLinejoin="round" fill="url(#generate-gradient)" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" className="text-zk-primary opacity-20" />
      <defs>
        <linearGradient id="generate-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DeployIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-zk-primary" />
      <path d="M12 3V12M12 21V12M12 12L4 7.5M12 12L20 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-zk-secondary opacity-40" />
      <circle cx="12" cy="12" r="2" fill="url(#deploy-gradient)" />
      <defs>
        <linearGradient id="deploy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

