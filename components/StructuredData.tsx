/**
 * Structured Data (JSON-LD) Component
 * Renders schema.org markup for SEO
 */

import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </>
  );
}

