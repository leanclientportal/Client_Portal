'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TENANT_ID_KEY = 'clientverse_tenant_id';
const JWT_TOKEN_KEY = 'clientverse_jwt';

export const useAuth = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedTenantId = localStorage.getItem(TENANT_ID_KEY);
      const storedToken = localStorage.getItem(JWT_TOKEN_KEY);
      if (storedTenantId && storedToken) {
        setTenantId(storedTenantId);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((jwt: string, tenant: string) => {
    try {
      localStorage.setItem(TENANT_ID_KEY, tenant);
      localStorage.setItem(JWT_TOKEN_KEY, jwt);
      setTenantId(tenant);
      setToken(jwt);
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TENANT_ID_KEY);
      localStorage.removeItem(JWT_TOKEN_KEY);
      setTenantId(null);
      setToken(null);
      router.push('/login');
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!tenantId && !isAuthPage) {
        router.replace('/login');
      }
      if (tenantId && (isAuthPage || pathname === '/')) {
        router.replace('/dashboard');
      }
    }
  }, [tenantId, isLoading, pathname, router]);

  return { tenantId, token, isLoading, login, logout };
};
