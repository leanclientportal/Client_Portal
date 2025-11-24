'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendOtp, verifyOtp } from '@/lib/auth';
import { switchAccount } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { SwitchAccountPayload, SwitchAccountResponse } from '@/lib/types';

export function useSendOtp() {
  return useMutation({ mutationFn: (data: { email: string; type: 'registration' | 'login' }) => sendOtp(data.email, data.type) });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: (data: { email: string; otp: string; type: 'registration' | 'login'; name?: string; phone?: string; profileType?: string }) => verifyOtp(data.email, data.otp, data.type, { name: data.name, phone: data.phone, activeProfile: data.profileType }) });
}

export function useSwitchAccount() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SwitchAccountResponse, Error, { userId: string; token: string; payload: SwitchAccountPayload }>({
    mutationFn: ({ userId, token, payload }) => switchAccount(userId, token, payload),
    onSuccess: (data) => {
      login(data.token, data.userId, data.activeProfile, data.activeProfileId, data.activeProfileImage);
      queryClient.invalidateQueries({ queryKey: ['accounts', data.userId] });
      window.location.reload();
    },
  });
}
