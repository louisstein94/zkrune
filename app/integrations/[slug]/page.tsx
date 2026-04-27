import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntegration, integrations } from "@/data/integrations";
import { IntegrationHero } from "@/components/integrations/IntegrationHero";

export function generateStaticParams() {
  return integrations.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) return {};
  return {
    title: `zkRune × ${integration.name} — ${integration.tier} integration`,
    description: integration.description,
    alternates: { canonical: `https://zkrune.com/integrations/${slug}` },
  };
}

export default async function IntegrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) notFound();

  return (
    <>
      <IntegrationHero integration={integration} />

      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-3xl mx-auto p-8 bg-zk-dark/60 border border-zk-gray/15 rounded-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zk-gray/70 mb-3">
            Reference design in progress
          </p>
          <h2 className="font-hatton text-2xl text-white mb-3">
            Architecture coming this week
          </h2>
          <p className="text-sm text-zk-gray leading-relaxed mb-6">
            We are publishing one reference design per day. This page will be
            updated with a full architecture, code sketch, and a working ZK
            demo. If you are on the {integration.name} team — or want to
            sponsor this design moving up the queue — get in touch.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:zkruneprotocol@gmail.com?subject=zkRune%20%C3%97%20${encodeURIComponent(
                integration.name
              )}%20integration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zk-primary to-zk-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Build this with us
            </a>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zk-gray/30 text-zk-gray text-sm font-medium rounded-lg hover:text-white hover:border-zk-primary/40 transition-colors"
            >
              See all integrations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}