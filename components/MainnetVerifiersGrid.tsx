// Renders the canonical 3-chain verifier contract grid used by /trust,
// /enterprise, /enterprise/eudi-wallet, and any future page that
// anchors trust on the on-chain keys.
//
// Data comes from lib/verifiers.ts (single source). Callers can
// override eyebrow/heading/body copy to fit their context.

import { MAINNET_VERIFIERS } from "@/lib/verifiers";

interface MainnetVerifiersGridProps {
  /** Small uppercase eyebrow above the heading. */
  eyebrow?: string;
  /** Section heading. */
  heading?: string;
  /** Optional paragraph below the heading. */
  body?: string;
  /** DOM id for in-page anchors. */
  sectionId?: string;
}

export default function MainnetVerifiersGrid({
  eyebrow = "On-chain anchors",
  heading = "Verifier contracts on mainnet.",
  body,
  sectionId,
}: MainnetVerifiersGridProps) {
  return (
    <section
      id={sectionId}
      className="relative z-10 px-6 md:px-12 lg:px-16 py-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 mb-8">
          <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
            {eyebrow}
          </span>
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            {heading}
          </h2>
          {body && <p className="text-zk-gray max-w-3xl text-sm">{body}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {MAINNET_VERIFIERS.map((v) => (
            <a
              key={v.chain}
              href={v.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-white/10 bg-zk-darker/60 hover:border-zk-primary/30 transition-colors block group"
            >
              <p className="text-xs font-bold text-zk-gray uppercase tracking-wider mb-2">
                {v.chain}
              </p>
              <p className="font-mono text-xs text-zk-primary break-all leading-relaxed">
                {v.address}
              </p>
              <p className="mt-3 text-xs text-zk-gray group-hover:text-white transition-colors">
                View on explorer ↗
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
