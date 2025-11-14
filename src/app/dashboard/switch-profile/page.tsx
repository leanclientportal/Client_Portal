'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getAccounts } from '@/queries/accounts';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSwitchAccount } from '@/queries/auth';
import { Account } from '@/lib/types';

export default function SwitchProfilePage() {
  const { token, userId, activeProfileId } = useAuth();
  const { data, isLoading } = getAccounts(token, userId);
  const switchAccountMutation = useSwitchAccount();

  const handleSwitch = (account: Account) => {
    if (userId && token) {
      switchAccountMutation.mutate({
        userId,
        token,
        payload: { activeProfile: account.type, masterId: account.id }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))
        : data?.accounts.map((account) => (
          <div key={account.id} className="flex flex-col gap-2 p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{account.type === 'client' ? 'Client Account' : 'Tenant Account'}</h3>
              {account.id === activeProfileId as string ? (
                <Badge className="bg-green-500 text-white">Active</Badge>
              ) : (
                <Button onClick={() => handleSwitch(account)}>
                  Switch
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-lg font-medium">{account.name}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{account.email}</p>
            <p className="text-sm text-gray-500">ID: {account.id}</p>
          </div>
        ))}
    </div>
  );
}
