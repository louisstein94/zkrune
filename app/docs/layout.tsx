import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider";
import Navigation from "@/components/Navigation";
import { source } from "@/lib/docs-source";
import "fumadocs-ui/style.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <Navigation />
      <div className="pt-20">
        <DocsLayout
          tree={source.pageTree}
          nav={{ enabled: false }}
          sidebar={{ defaultOpenLevel: 1 }}
        >
          {children}
        </DocsLayout>
      </div>
    </RootProvider>
  );
}
