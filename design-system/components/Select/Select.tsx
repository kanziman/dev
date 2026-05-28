"use client";

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  options: (SelectOption | SelectGroup)[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  errorText?: string;
  helperText?: string;
}

const isGroup = (item: SelectOption | SelectGroup): item is SelectGroup =>
  'options' in item;

const triggerBase =
  'inline-flex items-center justify-between w-full h-10 px-3 rounded-md border text-body1 text-label-normal bg-background-normal-normal transition-all duration-normal outline-none cursor-pointer';
const triggerNormal =
  'border-line-solid-normal hover:border-primary-normal focus:border-primary-normal focus:ring-2 focus:ring-primary-normal';
const triggerError =
  'border-status-negative focus:ring-2 focus:ring-status-negative';
const triggerDisabled =
  'disabled:bg-interaction-disable disabled:text-label-disable disabled:cursor-not-allowed disabled:border-line-normal-normal';

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = '선택하세요',
  disabled,
  label,
  errorText,
  helperText,
}) => {
  const hasError = Boolean(errorText);
  const id = label ? label.replace(/\s+/g, '-').toLowerCase() : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-label1 text-label-normal font-medium">
          {label}
        </label>
      )}

      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={id}
          aria-label={label}
          className={[triggerBase, hasError ? triggerError : triggerNormal, triggerDisabled].join(' ')}
        >
          <SelectPrimitive.Value placeholder={<span className="text-label-assistive">{placeholder}</span>} />
          <SelectPrimitive.Icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-popover w-[var(--radix-select-trigger-width)] bg-background-elevated-normal border border-line-solid-normal rounded-lg shadow-normal-medium overflow-hidden data-[state=open]:animate-slide-down-in data-[state=closed]:animate-slide-up-out"
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 text-label-assistive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1">
              {options.map((item, i) =>
                isGroup(item) ? (
                  <SelectPrimitive.Group key={i}>
                    <SelectPrimitive.Label className="px-3 py-1 text-caption1 text-label-assistive font-medium uppercase tracking-wider">
                      {item.label}
                    </SelectPrimitive.Label>
                    {item.options.map((opt) => <SelectItem key={opt.value} {...opt} />)}
                  </SelectPrimitive.Group>
                ) : (
                  <SelectItem key={item.value} {...item} />
                )
              )}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 text-label-assistive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hasError && (
        <p className="text-caption1 text-status-negative" role="alert">{errorText}</p>
      )}
      {!hasError && helperText && (
        <p className="text-caption1 text-label-assistive">{helperText}</p>
      )}
    </div>
  );
};

const SelectItem: React.FC<SelectOption> = ({ value, label, disabled }) => (
  <SelectPrimitive.Item
    value={value}
    disabled={disabled}
    className="relative flex items-center px-3 py-2 rounded-md text-body2 text-label-normal cursor-pointer outline-none select-none data-[highlighted]:bg-fill-normal data-[disabled]:text-label-disable data-[disabled]:cursor-not-allowed data-[state=checked]:text-primary-normal data-[state=checked]:font-medium"
  >
    <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);
