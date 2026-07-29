import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * Multi-line text field with label, hint and error message support.
 * Visually consistent with the Input component.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-800"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-[border-color,box-shadow] duration-200 ease-smooth resize-y min-h-[96px]',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-navy-200 hover:border-navy-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-navy-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
