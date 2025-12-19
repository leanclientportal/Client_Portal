// src/queries/auth.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendOtp, verifyOtp } from '@/lib/auth';
import { switchAccount } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { SwitchAccountPayload, SwitchAccountResponseData, CommonApiResponse } from '@/lib/types'; // Import CommonApiResponse and SwitchAccountResponseData

export function useSendOtp() {
  return useMutation({ mutationFn: (data: { email: string; type: 'registration' | 'login' }) => sendOtp(data.email, data.type) });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      otp: string;
      type: 'registration' | 'login';
      name?: string;
      phone?: string;
      profileType?: string;
      activeProfileImage?: string;
      profileName?: string;
    }) =>
      verifyOtp(
        data.email,
        data.otp,
        data.type,
        {
          name: data.name,
          phone: data.phone,
          activeProfile: data.profileType,
          activeProfileImage: data.activeProfileImage,
          profileName: data.profileName
        }
      )
  });
}


export function useSwitchAccount() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  // Updated generic types to expect CommonApiResponse<SwitchAccountResponseData>
  return useMutation<CommonApiResponse<SwitchAccountResponseData>, Error, { userId: string; token: string; payload: SwitchAccountPayload }>(
    {
      mutationFn: ({ userId, token, payload }) => switchAccount(userId, token, payload),
      onSuccess: (response) => { // 'response' is now CommonApiResponse<SwitchAccountResponseData>
        if (response.success && response.data) {
          const data = response.data; // Extract the actual data payload
          // Ensure activeProfileImage is a string by falling back to empty string if null
          login(
            data.token,
            data.userId,
            data.activeProfile,
            data.activeProfileId,
            data.activeProfileImage || '',
            data.profileName
          );
          queryClient.invalidateQueries({ queryKey: ['accounts', data.userId] });
          window.location.href = '/dashboard';
        } else {
          // Handle API success: false case, e.g., show a toast error
          console.error('Switch account failed:', response.message);
          // You might want to add a toast here for the user
        }
      },
      onError: (error) => {
        console.error('Error switching account:', error);
        // You might want to add a toast here for the user
      }
    }
  );
}
