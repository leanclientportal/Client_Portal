'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getGeneralSettings } from '@/lib/api';
import { setGeneralSettings } from '@/lib/utils';
import { GeneralSettings } from '@/lib/types';

export const useGeneralSettings = () => {
  const { activeProfileId, activeProfile, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetSettings = async () => {
      if (activeProfileId && token && activeProfile) {
        setIsLoading(true);
        try {
          const response = await getGeneralSettings(activeProfileId, activeProfile, token);
          if (response.success && response.data) {
            setGeneralSettings(response.data as GeneralSettings);
          }
        } catch (error) {
          console.error("Failed to fetch general settings", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAndSetSettings();
  }, [activeProfileId, activeProfile, token]);

  return { isLoading };
};
