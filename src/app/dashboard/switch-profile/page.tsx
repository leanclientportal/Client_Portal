'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getAccounts } from '@/queries/accounts'; // Corrected import to use the query hook
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSwitchAccount } from '@/queries/auth';
import type { Account } from '@/lib/types';
import { useRouter } from 'next/navigation';
import MergeProfileModal from './components/MergeProfileModal';
import BreadcrumbComp from '../layout/shared/breadcrumb/BreadcrumbComp';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";

export default function SwitchProfilePage() {
  const { token, userId, activeProfileId } = useAuth();

  // Use the React Query hook correctly
  const { data: response, isLoading } = getAccounts(token, userId);
  const accounts = response?.data?.accounts || []; // Derived state

  const switchAccountMutation = useSwitchAccount();
  const router = useRouter();

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedAccountForMerge, setSelectedAccountForMerge] = useState<Account | null>(null);
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null);

  const handleSwitch = (account: Account) => {
    if (userId && token) {
      setSwitchingAccountId(account.id);
      switchAccountMutation.mutate({
        userId,
        token,
        payload: { activeProfile: account.type, masterId: account.id }
      }, {
        onSettled: () => {
          setSwitchingAccountId(null);
        }
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
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Edit Profile" },
  ];
  return (
    <>
      <BreadcrumbComp title="Edit Profile" items={BCrumb} />
      <div className="relative ">
        {/* <div className="flex justify-end mb-4">
          <Button onClick={() => router.push('/dashboard/switch-profile/add-profile')}>
            Add New Profile
          </Button>
        </div> */}
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))
            : (accounts && accounts.length > 0) ? accounts.map((account) => (
              <div key={account.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar + Badge */}
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={
                          account.profileImageUrl ||
                          `https://ui-avatars.com/api/?name=${account.name.replace(/\s/g, '+')}&background=random`
                        }
                        alt={account.name}
                        className="h-12 w-12 rounded-full"
                      />
                    </div>

                    {/* User details */}
                    <div>
                      <div className="font-medium">{account.name}<Badge
                        variant={account.type === 'client' ? 'secondary' : 'secondary'}
                        className="capitalize text-xs mt-2 ml-2 bg-warning"
                      >
                        {account.type}
                      </Badge></div>
                      <div className="text-sm text-muted-foreground">{account.email}</div>
                      <div className="text-sm text-muted-foreground">{account.phone}</div>


                    </div>
                  </div>

                  <div className="flex items-center gap-2 ">
                    <Button
                      size="sm"
                      onClick={() => handleSwitch(account)}
                      disabled={account.id === activeProfileId as string || switchAccountMutation.isPending}
                      className={`${account.id === activeProfileId ? "bg-green-500 text-white" : ""} whitespace-nowrap`}
                    >
                      {switchingAccountId === account.id
                        ? 'Switching...'
                        : account.id === activeProfileId
                          ? 'Active'
                          : 'Switch'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className="h-9 w-9 flex items-center justify-center rounded-full cursor-pointer hover:bg-lightprimary hover:text-primary">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="flex gap-3 cursor-pointer text-yellow-500"
                          onClick={() => handleEdit(account.id)}
                        >
                          <Icon icon="solar:pen-new-square-broken" height={18} />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex gap-3 cursor-pointer text-green-500"
                          onClick={() => handleMerge(account)}
                        >
                          <Icon icon="solar:shuffle-outline" height={18} />
                          Merge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center col-span-full text-muted-foreground">No accounts found.</div>
            )
          }
        </div>
        {selectedAccountForMerge && (
          <MergeProfileModal
            isOpen={isMergeModalOpen}
            onClose={handleCloseModal}
            sourceAccount={selectedAccountForMerge}
            allAccounts={accounts}
            currentUserId={userId as string}
            authToken={token as string}
          />
        )}
      </div>
    </>
  );
}
