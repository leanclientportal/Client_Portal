import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GeneralSettings } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default settings
export let generalSettings: GeneralSettings = {
  dateFormat: "dd/MM/yyyy",
  amountFormat: "1,234.56",
};

export const setGeneralSettings = (settings: GeneralSettings) => {
  generalSettings = { ...generalSettings, ...settings };
};

export const formatDate = (dateString: string, format?: string) => {
  if (!dateString) return 'N/A';

  const targetFormat = format || generalSettings.dateFormat || 'dd/MM/yyyy';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (targetFormat) {
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy/MM/dd':
      return `${year}/${month}/${day}`;
    case 'dd/MM/yyyy':
    default:
      return `${day}/${month}/${year}`;
  }
};

export const formatAmount = (amount: number, format?: string) => {
  const targetFormat = format || generalSettings.amountFormat || '1,234.56';

  const [integerPart, decimalPart] = String(amount.toFixed(2)).split('.');

  if (targetFormat === '1.234,56') {
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  }

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formattedInteger}.${decimalPart}`;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
