"use client";

import React, { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';

const calendarClassNames = {
  root: 'p-3 select-none',
  months: 'flex flex-col',
  month: 'space-y-3',
  caption: 'flex justify-center pt-1 relative items-center h-8',
  caption_label: 'text-headline2 text-label-strong font-semibold',
  nav: 'flex items-center gap-1',
  nav_button: [
    'absolute h-7 w-7 p-0 inline-flex items-center justify-center rounded-md',
    'text-label-assistive hover:text-label-normal hover:bg-fill-normal',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal',
  ].join(' '),
  nav_button_previous: 'left-1',
  nav_button_next: 'right-1',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'text-label-assistive w-9 h-9 flex items-center justify-center text-caption1 font-medium',
  row: 'flex w-full mt-1',
  cell: 'relative h-9 w-9 p-0 text-center focus-within:relative focus-within:z-10',
  day: [
    'h-9 w-9 p-0 inline-flex items-center justify-center rounded-md text-body2',
    'text-label-normal hover:bg-fill-normal',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal',
  ].join(' '),
  day_selected: 'bg-primary-normal !text-white hover:bg-primary-strong rounded-md',
  day_today: 'text-primary-normal font-semibold',
  day_outside: 'text-label-disable opacity-40',
  day_disabled: 'text-label-disable opacity-40 cursor-not-allowed hover:bg-transparent',
  day_range_start: 'bg-primary-normal !text-white rounded-r-none rounded-l-md',
  day_range_end: 'bg-primary-normal !text-white rounded-l-none rounded-r-md',
  day_range_middle: '!bg-[rgba(0,102,255,0.08)] !text-primary-normal rounded-none hover:bg-[rgba(0,102,255,0.12)]',
  day_hidden: 'invisible',
};

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
);

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const triggerBase = [
  'inline-flex items-center justify-between w-full h-10 px-3 rounded-md border text-body2 bg-background-normal-normal',
  'transition-all duration-normal cursor-pointer outline-none',
  'focus:border-primary-normal focus:ring-2 focus:ring-primary-normal',
].join(' ');

/* ─────────────── DatePicker ─────────────── */

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  helperText?: string;
  errorText?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '날짜 선택',
  label,
  disabled,
  fromDate,
  toDate,
  helperText,
  errorText,
}) => {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(errorText);
  const id = label ? label.replace(/\s+/g, '-').toLowerCase() : undefined;

  const borderClass = hasError
    ? 'border-status-negative'
    : 'border-line-solid-normal hover:border-primary-normal';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-label1 text-label-normal font-medium">
          {label}
        </label>
      )}

      <PopoverPrimitive.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={[
              triggerBase,
              borderClass,
              disabled ? 'bg-interaction-disable text-label-disable cursor-not-allowed opacity-60' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className={value ? 'text-label-normal' : 'text-label-assistive'}>
              {value ? formatDate(value) : placeholder}
            </span>
            <span className="text-label-assistive"><CalendarIcon /></span>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-popover bg-background-elevated-normal border border-line-solid-normal rounded-xl shadow-normal-medium outline-none data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => { onChange?.(date); setOpen(false); }}
              fromDate={fromDate}
              toDate={toDate}
              classNames={calendarClassNames}
              components={{ IconLeft: ChevronLeft, IconRight: ChevronRight }}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {hasError && <p className="text-caption1 text-status-negative" role="alert">{errorText}</p>}
      {!hasError && helperText && <p className="text-caption1 text-label-assistive">{helperText}</p>}
    </div>
  );
};

/* ─────────────── DateRangePicker ─────────────── */

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  helperText?: string;
  errorText?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = '기간 선택',
  label,
  disabled,
  fromDate,
  toDate,
  helperText,
  errorText,
}) => {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(errorText);
  const id = label ? label.replace(/\s+/g, '-').toLowerCase() : undefined;

  const displayValue = value?.from
    ? value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : formatDate(value.from)
    : null;

  const borderClass = hasError
    ? 'border-status-negative'
    : 'border-line-solid-normal hover:border-primary-normal';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-label1 text-label-normal font-medium">
          {label}
        </label>
      )}

      <PopoverPrimitive.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={[
              triggerBase,
              borderClass,
              disabled ? 'bg-interaction-disable text-label-disable cursor-not-allowed opacity-60' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className={displayValue ? 'text-label-normal' : 'text-label-assistive'}>
              {displayValue ?? placeholder}
            </span>
            <span className="text-label-assistive"><CalendarIcon /></span>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-popover bg-background-elevated-normal border border-line-solid-normal rounded-xl shadow-normal-medium outline-none data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out"
          >
            <DayPicker
              mode="range"
              selected={value}
              onSelect={onChange}
              fromDate={fromDate}
              toDate={toDate}
              numberOfMonths={2}
              classNames={calendarClassNames}
              components={{ IconLeft: ChevronLeft, IconRight: ChevronRight }}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {hasError && <p className="text-caption1 text-status-negative" role="alert">{errorText}</p>}
      {!hasError && helperText && <p className="text-caption1 text-label-assistive">{helperText}</p>}
    </div>
  );
};
