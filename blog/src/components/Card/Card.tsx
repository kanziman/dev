import React from 'react';
import { Badge } from '../Badge/Badge';
import { Icon } from '../Icon/Icon';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  type?: 'youtube' | 'github' | 'book' | 'file-text';
  title?: string;
  summary?: string;
  tags?: string[];
  sourceUrl?: string;
  date?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className = '', type, title, summary, tags, sourceUrl, date, children, ...props }, ref) => {
    const classNames = [
      'bg-background-elevated-normal text-label-normal border border-line-normal-normal p-6 rounded-[20px] shadow-normal-small transition-all duration-200 flex flex-col',
      hoverable ? 'hover:shadow-normal-medium hover:-translate-y-1 cursor-pointer' : '',
      className
    ].filter(Boolean).join(' ');

    const getTypeIcon = (type: string): 'youtube' | 'github' | 'book' | 'file-text' => {
      switch (type) {
        case 'youtube': return 'youtube';
        case 'github': return 'github';
        case 'book': return 'book';
        default: return 'file-text';
      }
    };

    return (
      <div ref={ref} className={`${classNames} h-full`} {...props}>
        {title ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-primary-normal/10 text-primary-normal flex items-center justify-center">
                <Icon name={getTypeIcon(type || 'file-text')} size={20} />
              </div>
              {date && <span className="text-caption1 text-label-alternative">{date}</span>}
            </div>
            <h3 className="text-heading2 font-bold text-label-strong mb-2 line-clamp-2">{title}</h3>
            {summary && <p className="text-body1 text-label-neutral mb-6 line-clamp-3 flex-grow">{summary}</p>}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {tags.map((tag) => (
                  <Badge key={tag} variant="subtle" color="neutral">#{tag}</Badge>
                ))}
              </div>
            )}
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = 'Card';
