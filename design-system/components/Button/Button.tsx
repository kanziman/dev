import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outlined';
  color?: 'primary' | 'assistive' | 'positive' | 'negative';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  leadingContent?: React.ReactNode;
  trailingContent?: React.ReactNode;
  iconOnly?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      color = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled,
      leadingContent,
      trailingContent,
      iconOnly,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    let sizeClasses = '';
    if (size === 'small') sizeClasses = iconOnly ? 'w-8 h-8' : 'px-3 h-8 text-label2 gap-1';
    else if (size === 'medium') sizeClasses = iconOnly ? 'w-11 h-11' : 'px-4 h-10 text-label1 gap-2';
    else if (size === 'large') sizeClasses = iconOnly ? 'w-12 h-12' : 'px-5 h-12 text-headline2 gap-2';

    let colorClasses = '';
    if (variant === 'solid') {
      if (color === 'primary') colorClasses = 'bg-primary-normal text-white enabled:hover:bg-primary-strong enabled:active:bg-primary-heavy disabled:bg-interaction-disable disabled:text-label-disable border-transparent';
      else if (color === 'assistive') colorClasses = 'bg-fill-normal text-label-normal enabled:hover:bg-fill-strong disabled:bg-interaction-disable disabled:text-label-disable border-transparent';
      else if (color === 'positive') colorClasses = 'bg-status-positive text-white enabled:hover:opacity-90 disabled:bg-interaction-disable disabled:text-label-disable border-transparent';
      else if (color === 'negative') colorClasses = 'bg-status-negative text-white enabled:hover:opacity-90 disabled:bg-interaction-disable disabled:text-label-disable border-transparent';
    } else if (variant === 'outlined') {
      if (color === 'primary') colorClasses = 'bg-transparent text-primary-normal border-primary-normal enabled:hover:bg-[rgba(0,102,255,0.04)] disabled:text-label-disable disabled:border-line-normal-normal';
      else if (color === 'assistive') colorClasses = 'bg-transparent text-label-normal border-line-normal-normal enabled:hover:bg-fill-normal disabled:text-label-disable disabled:border-line-normal-normal';
      else if (color === 'positive') colorClasses = 'bg-transparent text-status-positive border-status-positive enabled:hover:bg-[rgba(18,213,137,0.04)] disabled:text-label-disable disabled:border-line-normal-normal';
      else if (color === 'negative') colorClasses = 'bg-transparent text-status-negative border-status-negative enabled:hover:bg-[rgba(255,66,66,0.04)] disabled:text-label-disable disabled:border-line-normal-normal';
    }

    const classNames = [
      'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-normal ease-standard border',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2',
      disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer',
      sizeClasses,
      colorClasses,
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>
            {leadingContent && <span className="inline-flex">{leadingContent}</span>}
            {!iconOnly && <span>{children}</span>}
            {iconOnly && children}
            {trailingContent && <span className="inline-flex">{trailingContent}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
