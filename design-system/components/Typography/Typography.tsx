import React from 'react';

type TypographyVariant =
  | 'display1' | 'display2' | 'display3'
  | 'title1' | 'title2' | 'title3'
  | 'heading1' | 'heading2'
  | 'headline1' | 'headline2'
  | 'body1' | 'body1-reading' | 'body2' | 'body2-reading'
  | 'label1' | 'label1-reading' | 'label2'
  | 'caption1' | 'caption2';

type TypographyColor =
  | 'normal' | 'strong' | 'neutral' | 'alternative' | 'assistive' | 'disable';

const defaultTagMap: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
  display1: 'h1', display2: 'h1', display3: 'h1',
  title1: 'h2', title2: 'h2', title3: 'h3',
  heading1: 'h4', heading2: 'h5',
  headline1: 'h6', headline2: 'h6',
  body1: 'p', 'body1-reading': 'p', body2: 'p', 'body2-reading': 'p',
  label1: 'span', 'label1-reading': 'span', label2: 'span',
  caption1: 'span', caption2: 'span',
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  color?: TypographyColor;
  as?: keyof React.JSX.IntrinsicElements;
}

const colorClassMap: Record<TypographyColor, string> = {
  normal:      'text-label-normal',
  strong:      'text-label-strong',
  neutral:     'text-label-neutral',
  alternative: 'text-label-alternative',
  assistive:   'text-label-assistive',
  disable:     'text-label-disable',
};

export const Typography: React.FC<TypographyProps> = ({
  variant,
  color = 'normal',
  as,
  className = '',
  children,
  ...props
}) => {
  const Tag = (as ?? defaultTagMap[variant]) as keyof React.JSX.IntrinsicElements;
  const variantClass = `text-${variant}`;
  const colorClass = colorClassMap[color];

  return React.createElement(
    Tag,
    { className: [variantClass, colorClass, className].filter(Boolean).join(' '), ...props },
    children
  );
};
