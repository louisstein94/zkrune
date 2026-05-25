import type { ReactNode } from "react";
import IntegrationsHeader from "./IntegrationsHeader";

export default function IntegrationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-accent/8 blur-[100px]" />
      </div>

      <IntegrationsHeader />

      <div className="relative z-10">{children}</div>
    </main>
  );
}
