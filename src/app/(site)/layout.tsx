/**
 * Layout for the public site route group.
 *
 * Note: the header, footer and mobile CTA frame are provided by the root
 * src/app/layout.tsx, so every route — the root placeholder included — sees a
 * consistent site shell. This layout is left as a passthrough, ready to be
 * extended when the route group needs something of its own (a different header,
 * breadcrumbs and so on).
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
