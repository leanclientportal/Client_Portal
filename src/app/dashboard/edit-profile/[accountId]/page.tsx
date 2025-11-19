'use client';

import React from 'react';
import AddProfileForm from '@/app/dashboard/add-profile/components/AddProfileForm';
import { useAuth } from '@/hooks/use-auth';
import { getAccounts } from '@/queries/accounts';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProfilePage() {
  const { token, userId } = useAuth();
  const params = useParams();
  const accountId = params.accountId as string;
  const { data, isLoading } = getAccounts(token, userId);

  const account = data?.accounts.find((acc) => acc.id === accountId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <AddProfileForm account={account} />
      )}
    </div>
  );
}
