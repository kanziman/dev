"use client";

import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label?: string;
}

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ options, label, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <span className="text-label1 text-label-normal font-medium">{label}</span>
    )}
    <RadioGroupPrimitive.Root
      ref={ref}
      className={['flex flex-col gap-3', className].join(' ')}
      {...props}
    >
      {options.map((opt) => (
        <div key={opt.value} className="flex items-start gap-2">
          <RadioGroupPrimitive.Item
            id={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className={[
              'w-5 h-5 mt-0.5 shrink-0 rounded-full border border-line-solid-normal bg-background-normal-normal',
              'transition-all duration-normal',
              'hover:border-primary-normal',
              'data-[state=checked]:border-primary-normal',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2.5 after:h-2.5 after:rounded-full after:bg-primary-normal" />
          </RadioGroupPrimitive.Item>

          <div className="flex flex-col gap-0.5">
            <label htmlFor={opt.value} className="text-body2 text-label-normal cursor-pointer select-none">
              {opt.label}
            </label>
            {opt.helperText && (
              <p className="text-caption1 text-label-assistive">{opt.helperText}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  </div>
));
RadioGroup.displayName = 'RadioGroup';
