"use client";

import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

export type ToastVariant = 'default' | 'positive' | 'cautionary' | 'negative';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  default:    'border-line-solid-normal',
  positive:   'border-status-positive bg-[rgba(18,213,137,0.06)]',
  cautionary: 'border-status-cautionary bg-[rgba(255,122,0,0.06)]',
  negative:   'border-status-negative bg-[rgba(255,66,66,0.06)]',
};

const variantIcon: Record<ToastVariant, React.ReactNode> = {
  default: null,
  positive: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-status-positive shrink-0">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  cautionary: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-status-cautionary shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  negative: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-status-negative shrink-0">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport: React.FC = () => (
  <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-snackbar flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] outline-none" />
);

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  action,
  duration = 4000,
}) => (
  <ToastPrimitive.Root
    open={open}
    onOpenChange={onOpenChange}
    duration={duration}
    className={[
      'flex items-start gap-3 p-4 rounded-xl border bg-background-elevated-normal shadow-normal-medium',
      'data-[state=open]:animate-slide-up-in data-[state=closed]:animate-slide-up-out',
      variantStyles[variant],
    ].join(' ')}
  >
    {variantIcon[variant]}

    <div className="flex-1 flex flex-col gap-0.5">
      {title && (
        <ToastPrimitive.Title className="text-label1 text-label-strong font-semibold">
          {title}
        </ToastPrimitive.Title>
      )}
      {description && (
        <ToastPrimitive.Description className="text-body2 text-label-alternative">
          {description}
        </ToastPrimitive.Description>
      )}
      {action && (
        <ToastPrimitive.Action altText={action.label} asChild>
          <button
            onClick={action.onClick}
            className="mt-1 text-label2 text-primary-normal font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-normal rounded"
          >
            {action.label}
          </button>
        </ToastPrimitive.Action>
      )}
    </div>

    <ToastPrimitive.Close
      aria-label="닫기"
      className="shrink-0 p-0.5 rounded text-label-assistive hover:text-label-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-normal"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
);
