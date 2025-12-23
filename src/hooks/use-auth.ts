'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const USER_ID_KEY = 'clientverse_user_id';
const JWT_TOKEN_KEY = 'clientverse_jwt';
const USER_ACTIVEPROFILE_KEY = 'user_activeProfile';
const USER_ACTIVEPROFILEID_KEY = 'user_activeProfileId';
const USER_ACTIVEPROFILEIMAGE_KEY = 'user_activeProfileImage';
const USER_PROFILENAME_KEY = 'user_profileName';

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeProfileImage, setActiveProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem(USER_ID_KEY);
      const storedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const activeProfile = localStorage.getItem(USER_ACTIVEPROFILE_KEY);
      const activeProfileId = localStorage.getItem(USER_ACTIVEPROFILEID_KEY);
      const activeProfileImage = localStorage.getItem(USER_ACTIVEPROFILEIMAGE_KEY);
      const profileName = localStorage.getItem(USER_PROFILENAME_KEY);
      if (storedToken && storedUserId) {
        setUserId(storedUserId);
        setToken(storedToken);
        setActiveProfile(activeProfile);
        setActiveProfileId(activeProfileId);
        setActiveProfileImage(activeProfileImage);
        setProfileName(profileName);
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((jwt: string, userId: string, activeProfile: string, activeProfileId: string, activeProfileImage: string, parofileName: string) => {
    try {
      localStorage.setItem(JWT_TOKEN_KEY, jwt);
      localStorage.setItem(USER_ID_KEY, userId);
      localStorage.setItem(USER_ACTIVEPROFILE_KEY, activeProfile);
      localStorage.setItem(USER_ACTIVEPROFILEID_KEY, activeProfileId);
      localStorage.setItem(USER_ACTIVEPROFILEIMAGE_KEY, activeProfileImage);
      localStorage.setItem(USER_PROFILENAME_KEY, parofileName);
      setToken(jwt);
      setUserId(userId);
      setActiveProfile(activeProfile);
      setActiveProfileId(activeProfileId);
      setActiveProfileImage(activeProfileImage);
      setProfileName(parofileName);
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
      localStorage.removeItem(USER_ACTIVEPROFILEIMAGE_KEY);
      localStorage.removeItem(USER_PROFILENAME_KEY);
      setUserId(null);
      setToken(null);
      setActiveProfile(null);
      setActiveProfileId(null);
      setActiveProfileImage(null);
      setProfileName(null);
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!token && !isAuthPage) {
        window.location.assign('/login');
      }
      if (token && (isAuthPage || pathname === '/')) {
        window.location.assign('/dashboard');
      }
    }
  }, [token, isLoading, pathname, router]);

  return { userId, token, isLoading, login, logout, activeProfile, activeProfileId, activeProfileImage, profileName };
};
