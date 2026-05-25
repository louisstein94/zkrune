"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { name: "All integrations", href: "/integrations" },
  { name: "Back to zkRune", href: "/" },
];

export default function IntegrationsHeader() {
  const [open, setOpen] = useState(false);

  // Close the drawer when the viewport grows past the mobile breakpoint
  // so the desktop links don't render twice.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/85 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/zkrune-log.png" alt="zkRune" className="h-9 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-hatton text-white">zkRune</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zk-gray">
                Integrations
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-zk-gray hover:text-white transition-colors"
              >
                {l.name}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="integrations-mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-white"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-current transition-transform ${
                  open ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current transition-transform ${
                  open ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {open && (
          <nav
            id="integrations-mobile-nav"
            className="md:hidden pt-4 pb-2 flex flex-col gap-3 text-sm"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-zk-gray hover:text-white transition-colors py-2"
              >
                {l.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
