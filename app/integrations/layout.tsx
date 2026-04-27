import Link from "next/link";
import type { ReactNode } from "react";

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

      <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/85 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/zkrune-log.png"
              alt="zkRune"
              className="h-9 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-hatton text-white">zkRune</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zk-gray">
                Integrations
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/integrations"
              className="text-zk-gray hover:text-white transition-colors"
            >
              All integrations
            </Link>
            <Link
              href="/"
              className="text-zk-gray hover:text-white transition-colors"
            >
              Back to zkRune
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>
    </main>
  );
}