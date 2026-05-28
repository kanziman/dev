import React from 'react';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'normal' | 'solid';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'normal',
  className = '',
  ...props
}) => {
  const borderColor = variant === 'solid' ? 'border-line-solid-normal' : 'border-line-normal-normal';

  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={['inline-block self-stretch w-px border-l', borderColor, className].filter(Boolean).join(' ')}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      />
    );
  }

  return (
    <hr
      className={['border-0 border-t', borderColor, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
};
