import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className = '', children, ...props }, ref) => {
    const classNames = [
      'bg-background-elevated-normal text-label-normal border border-line-normal-normal p-6 rounded-[16px] shadow-normal-small transition-all duration-200',
      hoverable ? 'hover:shadow-normal-medium hover:-translate-y-0.5 cursor-pointer' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
