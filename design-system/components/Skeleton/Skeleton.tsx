import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  lines?: number;
  gap?: string;
}

const roundedClass = {
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  lines,
  gap = '0.5rem',
  className = '',
  style,
  ...props
}) => {
  const base = ['animate-pulse bg-fill-strong', roundedClass[rounded], className].filter(Boolean).join(' ');

  if (lines && lines > 1) {
    return (
      <div className="flex flex-col" style={{ gap }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={base}
            style={{
              height: height ?? '1rem',
              width: i === lines - 1 ? '75%' : (width ?? '100%'),
              ...style,
            }}
            aria-hidden="true"
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={base}
      style={{ width: width ?? '100%', height: height ?? '1rem', ...style }}
      aria-hidden="true"
      {...props}
    />
  );
};

interface SkeletonCardProps {
  hasAvatar?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasAvatar = true,
  lines = 3,
}) => (
  <div className="p-4 rounded-xl border border-line-solid-normal flex flex-col gap-3 animate-pulse">
    {hasAvatar && (
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton height="0.875rem" width="50%" />
          <Skeleton height="0.75rem" width="35%" />
        </div>
      </div>
    )}
    <Skeleton lines={lines} height="0.875rem" />
  </div>
);
