import React from 'react';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      leadingIcon,
      trailingIcon,
      size = 'medium',
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
    const hasError = Boolean(errorText);

    const heightClass = size === 'small' ? 'h-9' : size === 'large' ? 'h-12' : 'h-10';
    const textClass = size === 'small' ? 'text-body2' : 'text-body1';
    const paddingX = leadingIcon ? 'pl-10' : 'pl-3';
    const paddingXRight = trailingIcon ? 'pr-10' : 'pr-3';

    const borderClass = hasError
      ? 'border-status-negative focus:ring-status-negative'
      : 'border-line-solid-normal focus:border-primary-normal focus:ring-primary-normal';

    const inputClasses = [
      'w-full rounded-md border bg-background-normal-normal text-label-normal',
      'placeholder:text-label-assistive',
      'transition-all duration-normal ease-standard outline-none',
      'focus:ring-2 focus:ring-offset-0',
      'disabled:bg-interaction-disable disabled:text-label-disable disabled:cursor-not-allowed',
      heightClass,
      textClass,
      paddingX,
      paddingXRight,
      borderClass,
    ].filter(Boolean).join(' ');

    return (
      <div className={['flex flex-col gap-1', className].join(' ')}>
        {label && (
          <label htmlFor={inputId} className="text-label1 text-label-normal font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3 text-label-assistive pointer-events-none">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={inputClasses}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3 text-label-assistive pointer-events-none">
              {trailingIcon}
            </span>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="text-caption1 text-status-negative" role="alert">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="text-caption1 text-label-assistive">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = 'TextField';
