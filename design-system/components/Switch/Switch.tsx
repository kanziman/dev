"use client";

import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  helperText?: string;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ label, helperText, id, className = '', ...props }, ref) => {
  const switchId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="inline-flex flex-col gap-0.5">
      <div className="inline-flex items-center gap-2">
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'bg-interaction-inactive transition-all duration-normal ease-standard',
            'data-[state=checked]:bg-primary-normal',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        >
          <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-normal-xsmall transition-transform duration-normal data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
        </SwitchPrimitive.Root>

        {label && (
          <label htmlFor={switchId} className="text-body2 text-label-normal cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>

      {helperText && (
        <p className="ml-[52px] text-caption1 text-label-assistive">{helperText}</p>
      )}
    </div>
  );
});
Switch.displayName = 'Switch';
