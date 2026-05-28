"use client";

import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-caption2',
  sm: 'w-8 h-8 text-caption1',
  md: 'w-10 h-10 text-label1',
  lg: 'w-12 h-12 text-headline1',
  xl: 'w-16 h-16 text-title3',
};

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
}) => {
  const initials = fallback
    ? fallback.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <AvatarPrimitive.Root
      className={[
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-fill-strong select-none',
        sizeClasses[size],
        className,
      ].filter(Boolean).join(' ')}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt ?? fallback ?? ''}
        className="h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        delayMs={src ? 400 : 0}
        className="flex h-full w-full items-center justify-center bg-primary-normal text-white font-semibold"
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
}

const overlapClass: Record<AvatarSize, string> = {
  xs: '-ml-2',
  sm: '-ml-2.5',
  md: '-ml-3',
  lg: '-ml-3.5',
  xl: '-ml-4',
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'md',
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex items-center">
      {visible.map((avatar, i) => (
        <div
          key={i}
          className={[
            'ring-2 ring-background-normal-normal rounded-full',
            i > 0 ? overlapClass[size] : '',
          ].filter(Boolean).join(' ')}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}

      {overflow > 0 && (
        <div
          className={[
            'ring-2 ring-background-normal-normal rounded-full',
            overlapClass[size],
            'inline-flex items-center justify-center bg-fill-strong text-label-alternative font-medium shrink-0',
            sizeClasses[size],
          ].join(' ')}
          style={{ zIndex: 0 }}
          aria-label={`외 ${overflow}명`}
        >
          <span className="text-caption1">+{overflow}</span>
        </div>
      )}
    </div>
  );
};
