"use client";

import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ label, helperText, id, className = '', ...props }, ref) => {
  const checkboxId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="inline-flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={[
            'w-5 h-5 shrink-0 rounded border border-line-solid-normal bg-background-normal-normal',
            'transition-all duration-normal',
            'hover:border-primary-normal',
            'data-[state=checked]:bg-primary-normal data-[state=checked]:border-primary-normal',
            'data-[state=indeterminate]:bg-primary-normal data-[state=indeterminate]:border-primary-normal',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
            {props.checked === 'indeterminate' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label && (
          <label htmlFor={checkboxId} className="text-body2 text-label-normal cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>

      {helperText && (
        <p className="ml-7 text-caption1 text-label-assistive">{helperText}</p>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
