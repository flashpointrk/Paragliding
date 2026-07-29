/**
 * Wrapper for an admin form field.
 *
 * Label plus children (Input/Select/Textarea/Checkbox) plus the hint/error
 * display. The UI primitives render their own label and error, so this
 * component is mainly for admin forms that need a custom control layout (radio
 * groups and the like).
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FormFieldProps): JSX.Element {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-navy-800"
        >
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-navy-500">{hint}</p>
      ) : null}
    </div>
  );
}
