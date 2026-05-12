'use client';

import React from 'react';
import AddProfileForm from '@/app/dashboard/switch-profile/add-profile/components/AddProfileForm';
import { useAuth } from '@/hooks/use-auth';
import { getAccounts } from '@/queries/accounts';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BreadcrumbComp from '@/app/dashboard/layout/shared/breadcrumb/BreadcrumbComp';

export default function EditProfilePage() {
  const { token, userId } = useAuth();
  const params = useParams();
  const accountId = params.accountId as string;
  const { data, isLoading } = getAccounts(token, userId);

  // Correctly access accounts from data.data.accounts
  const account = data?.data?.accounts.find((acc) => acc.id === accountId);
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Edit Profile" },
  ];
  return (
    <>
      <BreadcrumbComp title="Edit Profile" items={BCrumb} />
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background relative w-full break-words">
        <Card>
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
      </div>
    </>
  );
}
