"use client";

import React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  maxHeight?: string;
  scrollHideDelay?: number;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      orientation = 'vertical',
      maxHeight,
      scrollHideDelay = 600,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => (
    <ScrollAreaPrimitive.Root
      ref={ref}
      scrollHideDelay={scrollHideDelay}
      className={['relative overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ maxHeight, ...style }}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>

      {(orientation === 'vertical' || orientation === 'both') && (
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className="flex select-none touch-none p-0.5 transition-colors duration-normal data-[state=visible]:opacity-100 data-[state=hidden]:opacity-0 w-2.5"
        >
          <ScrollAreaPrimitive.Thumb className="flex-1 bg-line-solid-normal rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]" />
        </ScrollAreaPrimitive.Scrollbar>
      )}

      {(orientation === 'horizontal' || orientation === 'both') && (
        <ScrollAreaPrimitive.Scrollbar
          orientation="horizontal"
          className="flex select-none touch-none p-0.5 transition-colors duration-normal data-[state=visible]:opacity-100 data-[state=hidden]:opacity-0 h-2.5 flex-col"
        >
          <ScrollAreaPrimitive.Thumb className="flex-1 bg-line-solid-normal rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]" />
        </ScrollAreaPrimitive.Scrollbar>
      )}

      {orientation === 'both' && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  )
);
ScrollArea.displayName = 'ScrollArea';
