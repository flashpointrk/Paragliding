import * as React from 'react';

/**
 * Embeds JSON-LD structured data into the page.
 *
 * Several data objects may be passed; each renders as its own `<script>`, which
 * is the JSON-LD best practice.
 *
 * @example
 * <JsonLd data={[localBusinessJsonLd(), breadcrumbJsonLd(items)]} />
 */
export function JsonLd({
  data,
}: {
  data: object | object[];
}) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify is safe here; this is not user-supplied HTML.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
