"use client";

export function TemplateCardSkeleton() {
  return (
    <div className="bg-zk-dark/50 border border-zk-gray/20 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-zk-gray/20 rounded" />
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

export function ProofResultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 bg-zk-dark/50 border border-zk-gray/20 rounded-xl">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-zk-gray/20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-zk-gray/20 rounded w-2/3" />
            <div className="h-4 bg-zk-gray/20 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-zk-gray/20 rounded" />
          <div className="h-10 bg-zk-gray/20 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-zk-gray/20 rounded mb-4" />
            <div className="h-10 bg-zk-gray/20 rounded w-1/2 mb-2" />
            <div className="h-4 bg-zk-gray/20 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

