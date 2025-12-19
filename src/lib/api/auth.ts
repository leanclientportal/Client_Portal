// src/lib/api/auth.ts

import { httpClient } from './http-client';
import type {
  User,
  LoginCredentials,
  UpdateUserPayload,
  GetAccountsResponse,
  SwitchAccountPayload,
  SwitchAccountResponseData,
  NewProfile,
  CreateProfileResponse,
  MergeProfilesPayload,
  MergeProfilesResponse,
  CommonApiResponse,
  AuthResponseData,
  VerifyInvitationResponseData,
} from '../types';

// Assuming login function would not use httpClient directly if it returns AuthResponse structure directly
// For simplicity, adapting to httpClient's CommonApiResponse<T> return.
export async function login(credentials: LoginCredentials): Promise<CommonApiResponse<AuthResponseData>> {
  return httpClient<AuthResponseData>('/auth/login', {
    method: 'POST',
    data: credentials,
  });
}

// Function to update user
export async function updateUser(token: string, payload: UpdateUserPayload): Promise<CommonApiResponse<User>> {
  return httpClient<User>(`/users/me`, {
    method: 'PUT',
    token,
    data: payload,
  });
}

// Function to get accounts for a user
export async function getAccounts(token: string, userId: string): Promise<CommonApiResponse<GetAccountsResponse>> {
  const params = new URLSearchParams();
  params.append('timestamp', Date.now().toString()); // Cache busting
  return httpClient<GetAccountsResponse>(`/auth/get-accounts/${userId}?${params.toString()}`, { token });
}

export async function switchAccount(userId: string, token: string, payload: SwitchAccountPayload): Promise<CommonApiResponse<SwitchAccountResponseData>> {
  return httpClient<SwitchAccountResponseData>(`/auth/switch-account/${userId}`, {
    method: 'POST',
    token,
    data: payload,
  });
}

export async function createProfile(userId: string, token: string, newProfile: NewProfile): Promise<CommonApiResponse<CreateProfileResponse>> {
  return httpClient<CreateProfileResponse>(`/auth/create-profile/${userId}`, {
    method: 'POST',
    token,
    data: newProfile,
  });
}

export async function updateProfile(userId: string, token: string, accountId: string, updatedProfile: Partial<NewProfile>): Promise<CommonApiResponse<CreateProfileResponse>> {
  return httpClient<CreateProfileResponse>(`/auth/update-profile/${userId}/${accountId}`, {
    method: 'POST',
    token,
    data: updatedProfile,
  });
}

export async function verifyInvitation(token: string): Promise<CommonApiResponse<VerifyInvitationResponseData>> {
  return httpClient<VerifyInvitationResponseData>(`/auth/verify-invitation?token=${token}`);
}

export async function mergeProfiles(userId: string, token: string, payload: MergeProfilesPayload): Promise<CommonApiResponse<MergeProfilesResponse>> {
  return httpClient<MergeProfilesResponse>(`/auth/merge-profiles/${userId}`, {
    method: 'POST',
    token,
    data: payload,
  });
}
