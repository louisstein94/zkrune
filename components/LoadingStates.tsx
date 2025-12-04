"use client";

/**
 * Reusable loading states for consistent UX
 */

export function ProofGenerationLoader({ progress = 0 }: { progress?: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-32 h-32 mb-6">
        {/* Spinning rune */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <span className="text-7xl text-zk-primary opacity-50">ᚱ</span>
        </div>
        
        {/* Progress ring */}
        <svg className="absolute inset-0 w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-zk-gray/20"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-zk-primary transition-all duration-300"
            strokeDasharray={`${(progress / 100) * 377} 377`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-hatton text-white mb-2">
          ZK Proof Oluşturuluyor
        </h3>
        <p className="text-sm text-zk-gray mb-4">
          Kriptografik kanıt hesaplanıyor... {progress}%
        </p>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-zk-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-zk-primary to-zk-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CircuitLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        {/* Animated circuit dots */}
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-zk-primary animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-zk-gray mt-4 text-center">Devre yükleniyor...</p>
      </div>
    </div>
  );
}

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-zk-dark/50 rounded-lg h-full" />
    </div>
  );
}

export function TemplateCardSkeleton() {
  return (
    <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 bg-zk-gray/20 rounded-xl" />
        <div className="w-16 h-6 bg-zk-gray/20 rounded-full" />
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="h-6 bg-zk-gray/20 rounded w-3/4" />
        <div className="h-4 bg-zk-gray/20 rounded w-full" />
        <div className="h-4 bg-zk-gray/20 rounded w-5/6" />
      </div>
      
      <div className="h-10 bg-zk-gray/20 rounded-lg" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-zk-darker flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mb-6 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <span className="text-6xl text-zk-primary">ᚱ</span>
          </div>
        </div>
        <h2 className="text-2xl font-hatton text-white mb-2">zkRune</h2>
        <p className="text-sm text-zk-gray">Yükleniyor...</p>
      </div>
    </div>
  );
}

