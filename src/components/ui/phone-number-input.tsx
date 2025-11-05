'use client';

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from './input';

interface PhoneNumberInputProps {
  name: string;
}

export function PhoneNumberInput({ name }: PhoneNumberInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <PhoneInput
          {...field}
          placeholder="Enter phone number"
          defaultCountry="US"
          inputComponent={Input}
        />
      )}
    />
  );
}
