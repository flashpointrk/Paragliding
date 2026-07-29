import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Dropdown with label, hint, error and placeholder support.
 * Visually consistent with Input (matching height and focus ring).
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, hint, error, id, options, placeholder, ...props },
    ref
  ) => {
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
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-lg border bg-white px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-[border-color,box-shadow] duration-200 ease-smooth',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-navy-200 hover:border-navy-300',
            className
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
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
Select.displayName = 'Select';
