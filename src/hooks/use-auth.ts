'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const USER_ID_KEY = 'clientverse_user_id';
const JWT_TOKEN_KEY = 'clientverse_jwt';
const USER_ACTIVEPROFILE_KEY = 'user_activeProfile';
const USER_ACTIVEPROFILEID_KEY = 'user_activeProfileId';

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem(USER_ID_KEY);
      const storedToken = localStorage.getItem(JWT_TOKEN_KEY);
      if (storedToken && storedUserId) {
        setUserId(storedUserId);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((jwt: string, userId: string, activeProfile: string, activeProfileId: string) => {
    try {
      localStorage.setItem(JWT_TOKEN_KEY, jwt);
      localStorage.setItem(USER_ID_KEY, userId);
      localStorage.setItem(USER_ACTIVEPROFILE_KEY, activeProfile);
      localStorage.setItem(USER_ACTIVEPROFILEID_KEY, activeProfileId);
      setToken(jwt);
      setUserId(userId);
      setActiveProfile(activeProfile);
      setActiveProfileId(activeProfileId);
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(JWT_TOKEN_KEY);
      localStorage.removeItem(USER_ACTIVEPROFILE_KEY);
      localStorage.removeItem(USER_ACTIVEPROFILEID_KEY);
      setUserId(null);
      setToken(null);
      setActiveProfile(null);
      setActiveProfileId(null);
      router.push('/login');
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!token && !isAuthPage) {
        router.replace('/login');
      }
      if (token && (isAuthPage || pathname === '/')) {
        router.replace('/dashboard');
      }
    }
  }, [token, isLoading, pathname, router]);

  return { userId, token, isLoading, login, logout, activeProfile, activeProfileId };
};
