'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getGeneralSettings } from '@/lib/api';
import { setGeneralSettings as updateUtils } from '@/lib/utils';
import { GeneralSettings } from '@/lib/types';
import { SettingsContext } from '@/providers/SettingsContext';

interface Props {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: Props) => {
  const { activeProfileId, activeProfile, token } = useAuth();
  const [settings, setSettings] = useState<GeneralSettings>({});

  const fetchAndSetSettings = useCallback(async () => {
    if (activeProfileId && activeProfile && token) {
      try {
        const response = await getGeneralSettings(activeProfileId, activeProfile, token);
        if (response.success && response.data) {
          setSettings(response.data as GeneralSettings);
          updateUtils(response.data as GeneralSettings);
        }
      } catch (error) {
        console.error("Failed to fetch general settings", error);
      }
    }
  }, [activeProfileId, activeProfile, token]);

  useEffect(() => {
    fetchAndSetSettings();
  }, [fetchAndSetSettings]);

  const reloadSettings = () => {
    fetchAndSetSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
