'use client';

import React from 'react';
import AddProfileForm from '@/app/dashboard/switch-profile/add-profile/components/AddProfileForm';
import { useAuth } from '@/hooks/use-auth';
import { getAccounts } from '@/queries/accounts';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProfilePage() {
  const { token, userId } = useAuth();
  const params = useParams();
  const accountId = params.accountId as string;
  const { data, isLoading } = getAccounts(token, userId);

  const account = data?.accounts.find((acc) => acc.id === accountId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : account ? (
          <AddProfileForm account={account} />
        ) : (
          <p>Account not found.</p>
        )}
      </CardContent>
    </Card>
  );
}
