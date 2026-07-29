import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /**
   * Floating label effect.
   * true → the label sits inside the input and rises on focus or when filled.
   * Note: used together with the existing `label`.
   */
  floatingLabel?: boolean;
}

/**
 * Base input component.
 *
 * - Focus: sky ring with a smooth transition
 * - Error: red ring
 * - `floatingLabel`: the optional floating label effect
 *
 * Label, hint and error message are all supported.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, floatingLabel = false, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    const inputClasses = cn(
      'h-11 w-full rounded-lg border bg-white px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-[border-color,box-shadow,ring-color] duration-200 ease-smooth',
      error
        ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
        : 'border-navy-200 hover:border-navy-300',
      // In floating-label mode the placeholder stays hidden until focus:
      // otherwise it collides with the label sitting in the middle.
      floatingLabel
        ? 'pt-4 peer placeholder:text-transparent focus:placeholder:text-navy-300'
        : 'placeholder:text-navy-300',
      className
    );

    if (floatingLabel) {
      return (
        <div className="flex w-full flex-col gap-1.5">
          <div className="relative">
            <input
              ref={ref}
              id={inputId}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              placeholder={label ? ' ' : props.placeholder}
              className={inputClasses}
              {...props}
            />
            {label ? (
              <label
                htmlFor={inputId}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-navy-400 transition-all duration-200 ease-smooth peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-sky-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                {label}
              </label>
            ) : null}
          </div>
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
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={inputClasses}
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
Input.displayName = 'Input';
