import type { Metadata } from "next";

const title = "Private RWA Access";
const description =
  "A regulated offering verifies that an investor is accredited and in an accepted jurisdiction, without learning who they are, where they live, or which tier they hold.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | zkRune`,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | zkRune`,
    description,
    images: ["/og-image.png"],
  },
};

export default function RwaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
