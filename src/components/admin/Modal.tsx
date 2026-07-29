'use client';

/**
 * Modal for the admin CRUD forms.
 *
 * - Scale-in animation (Framer Motion) over a blurred glass-dark backdrop
 * - Closes on Esc and on a backdrop click
 * - Close button (the lucide X)
 * - Glass-light content card
 * - `open` is controlled; the parent owns it.
 * - Accessible: role=dialog, aria-modal
 */

import { useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { easeSpring, easeSmooth } from '@/lib/motion';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Width class (tailwind). */
  sizeClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  sizeClassName = 'max-w-lg',
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Scroll kilitle
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          {/* Glass-dark backdrop blur */}
          <m.div
            className="glass-dark fixed inset-0 bg-navy-900/60"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeSmooth }}
          />
          {/* Scale-in content card */}
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'glass-card relative z-10 my-8 w-full rounded-2xl bg-white shadow-floating',
              sizeClassName
            )}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: easeSpring }}
          >
            {title ? (
              <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Icon name="X" className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}
            <div className="px-6 py-5">{children}</div>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
