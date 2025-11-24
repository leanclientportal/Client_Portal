'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getAccounts } from '@/queries/accounts';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSwitchAccount } from '@/queries/auth';
import { Account } from '@/lib/types';
import { useRouter } from 'next/navigation';
import MergeProfileModal from './components/MergeProfileModal'; // Assuming the modal component will be created here

export default function SwitchProfilePage() {
  const { token, userId, activeProfileId } = useAuth();
  const { data, isLoading } = getAccounts(token, userId);
  const switchAccountMutation = useSwitchAccount();
  const router = useRouter();

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedAccountForMerge, setSelectedAccountForMerge] = useState<Account | null>(null);

  const handleSwitch = (account: Account) => {
    if (userId && token) {
      switchAccountMutation.mutate({
        userId,
        token,
        payload: { activeProfile: account.type, masterId: account.id }
      });
    }
  };

  const handleEdit = (accountId: string) => {
    router.push(`/dashboard/switch-profile/edit-profile/${accountId}`);
  };

  const handleMerge = (account: Account) => {
    setSelectedAccountForMerge(account);
    setIsMergeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMergeModalOpen(false);
    setSelectedAccountForMerge(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => router.push('/dashboard/switch-profile/add-profile')}>
          Add New Profile
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))
          : data?.accounts.map((account) => (
            <div key={account.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <img
                        src={account.profileImageUrl || `https://ui-avatars.com/api/?name=${account.name.replace(/\s/g, '+')}&background=random`}
                        alt={account.name}
                        className="h-12 w-12 rounded-full"
                    />
                    <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.email}</div>
                        <div className="text-sm text-muted-foreground">{account.phone}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant={account.type === 'client' ? 'secondary' : 'default' } className="capitalize">{account.type}</Badge>
                    {account.id === activeProfileId as string ? (
                        <Badge className="bg-green-500 text-white">Active</Badge>
                    ) : (
                        <Button size="sm" onClick={() => handleSwitch(account)} disabled={switchAccountMutation.isPending}>
                            {switchAccountMutation.isPending ? 'Switching...' : 'Switch'}
                        </Button>
                    )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(account.id)}>Edit</Button>
                <Button variant="outline" size="sm" onClick={() => handleMerge(account)}>Merge</Button>
              </div>
            </div>
          ))}
      </div>
      {selectedAccountForMerge && (
        <MergeProfileModal
          isOpen={isMergeModalOpen}
          onClose={handleCloseModal}
          sourceAccount={selectedAccountForMerge}
          allAccounts={data?.accounts || []}
          currentUserId={userId as string}
          authToken={token as string}
        />
      )}
    </div>
  );
}
