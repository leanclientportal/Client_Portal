'use client';

import React from 'react';
import { Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mergeProfiles } from '@/lib/api'; // Import the mergeProfiles function
import { MergeProfilesPayload, MergeProfilesResponse } from '@/lib/types'; // Import necessary types
import Image from 'next/image';

interface MergeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAccount: Account;
  allAccounts: Account[];
  currentUserId: string; // Assuming you have the current user's ID
  authToken: string;     // Assuming you have an authentication token
}

export default function MergeProfileModal({
  isOpen,
  onClose,
  sourceAccount,
  allAccounts,
  currentUserId,
  authToken,
}: MergeProfileModalProps) {
  const mergeCandidates = allAccounts.filter(
    (account) =>
      account.type === sourceAccount.type && account.id !== sourceAccount.id
  );

  const handleMerge = async (targetAccount: Account) => {
    console.log('Merging', sourceAccount, 'with', targetAccount);

    const payload: MergeProfilesPayload = {
      sourceProfileId: sourceAccount.id,
      targetProfileId: targetAccount.id,
      profileType: sourceAccount.type as 'client' | 'tenant',
    };

    try {
      const response: MergeProfilesResponse = await mergeProfiles(currentUserId, authToken, payload);

      if (response.success) {
        console.log('Profile merge successful:', response.message);
        // You might want to refresh the accounts list or show a success toast here
        onClose(); // Close the modal on success
      } else {
        console.error('Profile merge failed:', response.message);
        // Show an error message to the user
      }
    } catch (error) {
      console.error('Error during profile merge:', error);
      // Handle network errors or other exceptions
      // Show an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Merge Profiles</DialogTitle>
          <DialogDescription>
            Select a target profile to merge &quot;{sourceAccount.name}&quot; into.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 py-4">
          {/* Source Profile */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-center">Source Profile</h3>
            <div className="flex flex-col p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-4">
                  <img
                    src={sourceAccount.profileImageUrl || `https://ui-avatars.com/api/?name=${sourceAccount.name.replace(/\s/g, '+')}&background=random`}
                    alt={sourceAccount.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{sourceAccount.name}</div>
                    <div className="text-sm text-muted-foreground">{sourceAccount.email}</div>
                    <div className="text-sm text-muted-foreground">{sourceAccount.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Target Profiles */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-center">Target Profile</h3>
            {mergeCandidates.length === 0 ? (
              <p className="text-gray-600 text-center">No compatible profiles available for merging.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mergeCandidates.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
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
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleMerge(account)}
                    >
                      Merge this
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}