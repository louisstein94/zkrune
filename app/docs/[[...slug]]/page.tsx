import { notFound } from "next/navigation";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { source } from "@/lib/docs-source";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = source.getPage(params.slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
