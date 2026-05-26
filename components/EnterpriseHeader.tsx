// Shared header for the /enterprise/* funnel pages. Each vertical
// landing (AI Act, EUDI Wallet, future verticals) supplies its own
// in-page anchor nav and CTA. The brand sub-line ("For Compliance",
// "For EUDI Implementers") differentiates the page within the
// /enterprise family while keeping the header bar visually consistent.

import Link from "next/link";

export interface EnterpriseHeaderNavItem {
  /** In-page anchor (e.g. "#mapping") or external href. */
  href: string;
  label: string;
}

export interface EnterpriseHeaderCTA {
  href: string;
  label: string;
}

interface EnterpriseHeaderProps {
  /** Brand sub-line shown under the zkRune wordmark. */
  subtitle: string;
  /** Anchor nav, rendered desktop-only. Keep to 3–5 items. */
  navItems: EnterpriseHeaderNavItem[];
  /** Right-aligned primary CTA, rendered desktop-only. */
  cta: EnterpriseHeaderCTA;
  /** Where the logo links. Defaults to /enterprise. */
  homeHref?: string;
}

export default function EnterpriseHeader({
  subtitle,
  navItems,
  cta,
  homeHref = "/enterprise",
}: EnterpriseHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/85 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href={homeHref} className="flex items-center gap-3 group">
          <img src="/zkrune-log.png" alt="zkRune" className="h-9 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-hatton text-white">zkRune</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zk-gray">
              {subtitle}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={cta.href}
          className="hidden md:inline-flex px-5 py-2 bg-white text-zk-darker font-medium rounded-full hover:bg-zk-gray/90 transition-all text-sm"
        >
          {cta.label}
        </a>
      </div>
    </header>
  );
}
