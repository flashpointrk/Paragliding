'use client';

/**
 * Cloudflare Turnstile — the client widget.
 *
 * Injects Cloudflare's auto-loading script (`api.js`, async defer) into the
 * page and creates a `cf-turnstile` div. The script renders an invisible
 * challenge inside that div and fires its callbacks through the global
 * `window.turnstile` once it completes.
 *
 * Token flow:
 *  - The user passes the challenge → `callback(token)` → onToken(token).
 *  - The token expires → `expired-callback` → onToken(null).
 *  - On failure → `error-callback` → onToken(null).
 *
 * Worth noting:
 *  - `siteKey` is PUBLIC and arrives as a prop from the server (settings).
 *  - The token is handed to the parent form and posted to the backend as
 *    `cf-turnstile-response`, which the backend verifies through the canonical
 *    siteverify endpoint.
 *  - Accessibility: associated with a hidden label and aria attributes.
 */

import * as React from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js';

/** Type of the global turnstile API (provided by the Cloudflare script). */
interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileProps {
  /** Public site key (must come from the server). */
  siteKey: string;
  /** Called when a token arrives. Passes null when the token is cleared. */
  onToken: (token: string | null) => void;
  /** Visual theme (defaults to auto). */
  theme?: 'light' | 'dark' | 'auto';
  /** Error message, when the parent wants to surface one. */
  error?: string;
  /** Helper text. */
  hint?: string;
  className?: string;
}

/**
 * The Turnstile widget. Renders into the container once the Cloudflare script
 * has loaded, and reports token changes to the parent.
 */
export function Turnstile({
  siteKey,
  onToken,
  theme = 'auto',
  error,
  hint,
  className,
}: TurnstileProps): JSX.Element {
  const { s: sz } = useDictionary();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const reactId = React.useId();
  const labelId = `${reactId}-label`;
  const describedBy = error ? `${reactId}-error` : hint ? `${reactId}-hint` : undefined;

  // Wrap the token callbacks in a ref to keep a stable reference during
  // render (the CF API reads its options object exactly once).
  const onTokenRef = React.useRef(onToken);
  onTokenRef.current = onToken;

  // (Re-)render the widget: immediately if the script is loaded, else onLoad.
  const renderWidget = React.useCallback(() => {
    const ts = window.turnstile;
    const el = containerRef.current;
    if (!ts || !el) return;

    // Remove any previous widget before re-rendering.
    if (widgetIdRef.current) {
      try {
        ts.remove(widgetIdRef.current);
      } catch {
        // yoksay
      }
      widgetIdRef.current = null;
    }

    try {
      widgetIdRef.current = ts.render(el, {
        sitekey: siteKey,
        action: 'yamac-rezervasyon',
        theme,
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => onTokenRef.current(null),
      });
    } catch (err) {
      console.error('[Turnstile] render failed:', err);
    }
  }, [siteKey, theme]);

  // Render once the script has loaded, or straight away if it already has.
  const handleScriptLoad = React.useCallback(() => {
    renderWidget();
  }, [renderWidget]);

  // On mount: render if the script is already loaded.
  React.useEffect(() => {
    if (window.turnstile) {
      renderWidget();
    }
    return () => {
      // On unmount: remove the widget (memory/cleanup).
      const ts = window.turnstile;
      if (ts && widgetIdRef.current) {
        try {
          ts.remove(widgetIdRef.current);
        } catch {
          // yoksay
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  // Re-render when siteKey changes.
  React.useEffect(() => {
    if (window.turnstile) {
      renderWidget();
    }
  }, [siteKey, renderWidget]);

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        async
        defer
        onLoad={handleScriptLoad}
      />
      <div
        className={cn('flex w-full flex-col gap-1.5', className)}
        role="group"
        aria-labelledby={labelId}
      >
        {/* Accessible label — descriptive for screen readers. */}
        <span id={labelId} className="sr-only">
          {sz.common.securityCheck}
        </span>

        <div ref={containerRef} aria-describedby={describedBy} />

        {error ? (
          <p id={`${reactId}-error`} className="text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${reactId}-hint`} className="text-xs text-navy-500">
            {hint}
          </p>
        ) : null}
      </div>
    </>
  );
}
