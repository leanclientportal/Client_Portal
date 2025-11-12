'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const USER_ID_KEY = 'clientverse_user_id';
const JWT_TOKEN_KEY = 'clientverse_jwt';

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
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

  const login = useCallback((jwt: string, user: string) => {
    try {
      localStorage.setItem(USER_ID_KEY, user);
      localStorage.setItem(JWT_TOKEN_KEY, jwt);
      setUserId(user);
      setToken(jwt);
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(JWT_TOKEN_KEY);
      setUserId(null);
      setToken(null);
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

  return { userId, token, isLoading, login, logout };
};
