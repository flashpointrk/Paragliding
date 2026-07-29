'use client';

/**
 * Booking status update form (client).
 *
 * Submit → POST /api/admin/booking/[id]/status
 * Refreshes the page on success (router.refresh).
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { BookingStatus } from '@prisma/client';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'CANCELLED', label: 'Cancel' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function StatusUpdateForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<string>(currentStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successful, setSucceeded] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSucceeded(false);

    try {
      const res = await fetch(
        `/api/admin/booking/${bookingId}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, note: note.trim() || null }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? 'Update failed.');
      }
      setSucceeded(true);
      setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Select
        label="New status"
        value={status}
        options={STATUS_OPTIONS}
        onChange={(e) => setStatus(e.target.value)}
        disabled={loading}
      />
      <Textarea
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Customer informed, postponed due to weather, and so on."
        disabled={loading}
        rows={3}
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {successful ? (
        <p className="text-sm text-green-600" role="status">
          Status updated.
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Updating…' : 'Update status'}
      </Button>
    </form>
  );
}
