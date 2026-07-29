import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

/**
 * Checkbox. The label is a ReactNode, because it may carry rich content such as
 * a link. Accessibility: the input is associated with its label, and the error
 * through aria-describedby.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0 rounded border-navy-300 text-sky-500 focus:ring-2 focus:ring-sky-400 focus:ring-offset-0 transition-[box-shadow,border-color] duration-200 ease-smooth cursor-pointer checked:border-sky-500',
              error && 'border-red-400',
              className
            )}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="text-sm leading-relaxed text-navy-700 cursor-pointer select-none"
          >
            {label}
          </label>
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 pl-7">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
