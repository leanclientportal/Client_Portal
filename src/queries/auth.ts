'use client';

import { useMutation } from '@tanstack/react-query';
import { login, register, sendOtp, verifyOtp } from '@/lib/auth';
import { LoginCredentials, RegisterCredentials } from '@/lib/types';

export function useLogin() {
  return useMutation({ mutationFn: (credentials: LoginCredentials) => login(credentials) });
}

export function useRegister() {
  return useMutation({ mutationFn: (credentials: RegisterCredentials) => register(credentials) });
}

export function useSendOtp() {
  return useMutation({ mutationFn: (email: string) => sendOtp(email) });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: (data: { email: string; otp: string; }) => verifyOtp(data.email, data.otp) });
}
