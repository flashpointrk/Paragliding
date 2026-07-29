'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat';
import { GlidingCanopy } from '@/components/site/GlidingCanopy';
import { JsonLd } from '@/components/site/JsonLd';
import {
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo/structured-data';
import { useDictionary } from '@/lib/i18n/useDictionary';

/** Keeps the public, sign-in and admin surfaces in separate shells. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useDictionary();
  const bareSurface = pathname === '/login' || pathname.startsWith('/admin');

  if (bareSurface) return <>{children}</>;

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(locale)]} />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <GlidingCanopy />
      </div>
    </>
  );
}
