'use client';

/**
 * New user form (client).
 *
 * Submit → POST /api/admin/users (the bcrypt hash happens in the API).
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('OPERATOR');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password,
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.message ?? 'Could not save.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        error={errors.name}
      />
      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        minLength={8}
        hint="At least 8 characters"
        error={errors.password}
      />
      <Select
        label="Role"
        value={role}
        options={[
          { value: 'OPERATOR', label: 'OPERATOR' },
          { value: 'ADMIN', label: 'ADMIN' },
        ]}
        onChange={(e) => setRole(e.target.value)}
        disabled={loading}
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Creating…' : 'Create user'}
        </Button>
      </div>
    </form>
  );
}
