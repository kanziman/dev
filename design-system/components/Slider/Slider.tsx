"use client";

import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ label, showValue = false, formatValue, className = '', ...props }, ref) => {
  const currentValue = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [props.min ?? 0];

  const format = formatValue ?? ((v: number) => String(v));

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label1 text-label-normal font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-label2 text-label-alternative">
              {currentValue.length === 2
                ? `${format(currentValue[0])} – ${format(currentValue[1])}`
                : format(currentValue[0])}
            </span>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        ref={ref}
        className={[
          'relative flex w-full touch-none select-none items-center',
          props.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-fill-strong">
          <SliderPrimitive.Range className="absolute h-full bg-primary-normal" />
        </SliderPrimitive.Track>

        {currentValue.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block h-5 w-5 rounded-full border-2 border-primary-normal bg-background-normal-normal shadow-normal-small transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 hover:scale-110 active:scale-95"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = 'Slider';
