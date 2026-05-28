"use client";

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

type AccordionType = 'single' | 'multiple';

interface AccordionItem {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: AccordionType;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: 'default' | 'separated';
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  className = '',
}) => {
  const rootProps = {
    defaultValue: defaultValue as string,
    value: value as string,
    onValueChange: onValueChange as (val: string) => void,
    collapsible: true as const,
  };

  const containerClass = variant === 'separated'
    ? 'flex flex-col gap-2'
    : 'border border-line-solid-normal rounded-xl overflow-hidden divide-y divide-line-solid-normal';

  const itemClass = variant === 'separated'
    ? 'border border-line-solid-normal rounded-xl overflow-hidden'
    : '';

  return (
    <AccordionPrimitive.Root
      type={type as 'single'}
      className={[containerClass, className].filter(Boolean).join(' ')}
      {...rootProps}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={itemClass}
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              className={[
                'group flex w-full items-center justify-between px-4 py-4 text-headline1 text-label-normal font-medium',
                'transition-colors duration-normal hover:text-primary-normal',
                'data-[disabled]:text-label-disable data-[disabled]:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-normal',
              ].join(' ')}
            >
              <span>{item.trigger}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0 text-label-assistive transition-transform duration-normal ease-standard group-data-[state=open]:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          <AccordionPrimitive.Content
            className="overflow-hidden data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-close"
          >
            <div className="px-4 pb-4 text-body1 text-label-alternative">
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};
