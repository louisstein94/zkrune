interface Step {
  label: string;
  detail: string;
  status?: "real" | "simulated";
}

export function ArchitectureDiagram({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`relative p-5 bg-zk-dark/60 border rounded-xl ${
            step.status === "simulated"
              ? "border-zk-gray/20"
              : "border-zk-primary/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-zk-gray">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step.status && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  step.status === "real"
                    ? "border-zk-secondary/40 bg-zk-secondary/10 text-zk-secondary"
                    : "border-zk-gray/30 bg-zk-gray/10 text-zk-gray"
                }`}
              >
                {step.status === "real" ? "Live" : "Simulated"}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white mb-1.5">{step.label}</p>
          <p className="text-xs text-zk-gray leading-relaxed">{step.detail}</p>

          {i < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
              <svg
                className="w-4 h-4 text-zk-gray/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}