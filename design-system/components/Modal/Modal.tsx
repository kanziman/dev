"use client";

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClass = {
  small:  'max-w-sm',
  medium: 'max-w-lg',
  large:  'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  size = 'medium',
  children,
  footer,
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

    <Dialog.Portal>
      {/* Dimmer overlay */}
      <Dialog.Overlay className="fixed inset-0 z-modal bg-material-dimmer data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />

      {/* Content */}
      <Dialog.Content
        className={[
          'fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)]',
          '-translate-x-1/2 -translate-y-1/2',
          'bg-background-elevated-normal rounded-2xl shadow-normal-large',
          'p-6 flex flex-col gap-4 outline-none',
          'data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out',
          sizeClass[size],
        ].join(' ')}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex flex-col gap-1 pr-6">
            {title && (
              <Dialog.Title className="text-title3 text-label-strong">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-body2 text-label-alternative">
                {description}
              </Dialog.Description>
            )}
          </div>
        )}

        {/* Body */}
        <div className="text-body1 text-label-normal">{children}</div>

        {/* Footer */}
        {footer && <div className="flex justify-end gap-2 pt-2">{footer}</div>}

        {/* Close button */}
        <Dialog.Close
          aria-label="닫기"
          className="absolute right-4 top-4 p-1 rounded-md text-label-assistive hover:text-label-normal hover:bg-fill-normal transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
