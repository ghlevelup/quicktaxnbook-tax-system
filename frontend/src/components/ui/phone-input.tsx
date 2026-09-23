'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/libs/utils';
import RPNInput, { type Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './phone-input.css';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  defaultCountry?: string;
}

/** Phone number input with a country-code selector, backed by libphonenumber-js
 * (via react-phone-number-input). Value is stored/emitted in E.164 format. */
export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'Phone number',
  className,
  id,
  defaultCountry = 'US',
}: PhoneInputProps) {
  return (
    <RPNInput
      id={id}
      international
      defaultCountry={defaultCountry as never}
      value={value as Value | undefined}
      onChange={(next) => onChange?.(next ?? '')}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={cn('phone-input-shadcn flex items-center gap-2', className)}
      inputComponent={Input}
    />
  );
}
