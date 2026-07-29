'use client';

/**
 * Sign-in form (client) — the "Open Sky" design language, kept plain.
 *
 * `useSearchParams` lives here and is wrapped in Suspense by
 * `/login/page.tsx`.
 *
 * Plain inputs inside a flat white card, with a warm gold "Sign in" button. No
 * glass, glow, magnetic effects or gradients.
 *
 * Brute-force protection (unchanged): after a failed attempt it calls
 * `/api/auth/lock-check?email=...` to read the lock state. While locked the
 * user sees the time remaining and the form is disabled.
 */

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface LockState {
  locked: boolean;
  attemptsLeft: number | null;
  retryDelayMs: number | null;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const callbackUrl = params.get('callbackUrl') ?? '/admin';
  const errorParam = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? 'Could not sign in. Please check your details.' : null
  );
  const [lock, setLock] = useState<LockState | null>(null);

  // Local timer for the countdown while locked
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (lock?.locked && lock.retryDelayMs) {
      const start = Math.ceil(lock.retryDelayMs / 1000);
      setSecondsLeft(start);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setLock(null);
            setSecondsLeft(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [lock]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      // Brute-force kilit durumunu kontrol et
      try {
        const r = await fetch(
          `/api/auth/lock-check?email=${encodeURIComponent(email)}`,
          { method: 'GET' }
        );
        const status: LockState = await r.json();
        setLock(status);
        if (status.locked && status.retryDelayMs) {
          const minutes = Math.ceil(status.retryDelayMs / 60000);
          setError(
            `Too many failed attempts. The account is locked for ${minutes} minute(s). Please try again later.`
          );
        } else {
          setError('Incorrect e-mail or password. Please try again.');
        }
      } catch {
        setError('Incorrect e-mail or password. Please try again.');
      }
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  const lockedView = Boolean(lock?.locked && secondsLeft);
  const formDisabled = loading || lockedView;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@email.com"
        disabled={formDisabled}
        floatingLabel
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        disabled={formDisabled}
        floatingLabel
      />

      {/* Lock notice — a plain amber box */}
      {lockedView ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
        >
          <Icon
            name="Info"
            className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-yellow-800">
              The account is temporarily locked
            </p>
            {secondsLeft !== null ? (
              <p className="font-mono text-xs text-yellow-700">
                Time remaining:{' '}
                <span className="font-bold">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4',
            lockedView
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          )}
        >
          <Icon
            name={lockedView ? 'Info' : 'AlertTriangle'}
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              lockedView ? 'text-yellow-600' : 'text-red-600'
            )}
            aria-hidden="true"
          />
          <p
            className={cn(
              'text-sm font-medium',
              lockedView ? 'text-yellow-800' : 'text-red-800'
            )}
          >
            {error}
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        disabled={formDisabled}
        className="w-full gap-2"
      >
        <Icon name="ShieldCheck" className="h-5 w-5" aria-hidden="true" />
        {loading
          ? 'Signing in…'
          : lockedView
            ? 'Account locked'
            : 'Sign in'}
      </Button>
    </form>
  );
}
