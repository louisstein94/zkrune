import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'zkRune Widget',
  description: 'Embeddable ZK verification widget',
};

export default function WidgetEmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
