
import { useState, useEffect } from 'react';

export function useUserRole() {
  const [role, setRole] = useState<'client' | 'tenant' | null>(null);

  useEffect(() => {
    const userActiveProfile = localStorage.getItem('user_activeProfile');
    if (userActiveProfile) {
      setRole(userActiveProfile.toLowerCase() as 'client' | 'tenant');
    }
  }, []);

  return role;
}
