'use client';

import { createContext, useContext } from 'react';
import { GeneralSettings } from '@/lib/types';

interface SettingsContextType {
  settings: GeneralSettings;
  reloadSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
