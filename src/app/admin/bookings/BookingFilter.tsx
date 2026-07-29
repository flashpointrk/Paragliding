'use client';

/**
 * Booking list filter form (client).
 *
 * Driven by URL query parameters (status, start, end, q). Submit →
 * router.push (a new URL) → the server page re-renders. It also carries the
 * "Export (CSV)" and "Clear" actions.
 */

import { useState, FormEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'CANCELLED', label: 'Cancel' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function BookingFilter(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [start, setStart] = useState(params.get('start') ?? '');
  const [end, setBitis] = useState(params.get('end') ?? '');

  function buildHref(extra: Record<string, string> = {}): string {
    const sp = new URLSearchParams();
    const combined: Record<string, string> = {
      q,
      status,
      start,
      end,
      ...extra,
    };
    for (const [k, v] of Object.entries(combined)) {
      if (v) sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(buildHref());
    router.refresh();
  }

  function clear() {
    setQ('');
    setStatus('');
    setStart('');
    setBitis('');
    router.push(pathname);
    router.refresh();
  }

  function downloadCsv() {
    // Pass the same filters to the CSV endpoint as query parameters
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (status) sp.set('status', status);
    if (start) sp.set('start', start);
    if (end) sp.set('end', end);
    const s = sp.toString();
    window.location.href = `/api/admin/booking/export${s ? `?${s}` : ''}`;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-navy-100 bg-white p-4 shadow-card space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          label="Search"
          placeholder="Name, phone, e-mail"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Input
          label="Start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <Input
          label="End"
          type="date"
          value={end}
          onChange={(e) => setBitis(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Filter
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={downloadCsv}>
          Export CSV
        </Button>
      </div>
    </form>
  );
}
