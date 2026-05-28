import React from 'react';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  onRemove,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1 h-8 px-3 rounded-sm text-label1 font-medium border transition-all duration-normal ease-standard';
  const stateClasses = selected
    ? 'bg-primary-normal text-white border-primary-normal'
    : 'bg-background-normal-normal text-label-normal border-line-normal-normal enabled:hover:bg-fill-normal enabled:hover:border-line-solid-normal';
  const disabledClasses = 'disabled:opacity-40 disabled:cursor-not-allowed';
  const focusClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2';

  return (
    <button
      type="button"
      disabled={disabled}
      className={[baseClasses, stateClasses, disabledClasses, focusClasses, className].filter(Boolean).join(' ')}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <span
          role="button"
          aria-label="제거"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      )}
    </button>
  );
};
