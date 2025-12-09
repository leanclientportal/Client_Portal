'use client';
import React, { useEffect, useState } from 'react';
import PhoneInput, {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  getCountryCallingCode,
  Country,
} from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneNumberInputProps extends React.ComponentProps<typeof PhoneInput> {
  // any additional props
}

const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(({ className, defaultCountry, ...props }, ref) => {

  const [userCountry, setUserCountry] = useState<Country | undefined>();

  useEffect(() => {
    // This effect runs only on the client side
    if (!defaultCountry) { // Only run if no defaultCountry is provided in props
      const fetchCountry = async () => {
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (!response.ok) {
            throw new Error('Failed to fetch IP-based location');
          }
          const data = await response.json();
          if (data && data.country_code) {
            setUserCountry(data.country_code as Country);
          }
        } catch (e) {
          console.warn('Could not determine user country from IP address. Falling back to browser locale.');
          // Fallback to navigator.language if IP lookup fails
          try {
            const locale = navigator.language;
            if (locale) {
              const countryCode = locale.split('-')[1];
              if (countryCode) {
                setUserCountry(countryCode as Country);
              }
            }
          } catch (e2) {
             console.warn('Could not determine user country from browser locale.');
          }
        }
      };
      fetchCountry();
    }
  }, [defaultCountry]); // re-run if defaultCountry prop changes


  return (
    <PhoneInput
      className={cn('flex', className)}
      inputComponent={Input}
      defaultCountry={defaultCountry || userCountry}
      {...props}
      ref={ref}
    />
  );
});

PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;
export { isPossiblePhoneNumber, isValidPhoneNumber, getCountryCallingCode };
export type { Country };
