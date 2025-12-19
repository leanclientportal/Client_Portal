// src/lib/api/clients.ts

import { httpClient } from './http-client';
import type {
  Client,
  GetClientsResponse,
  NewClient,
  SelectListItem,
  ApiAddResponseData, // Use the data payload type
  CommonApiResponse,
} from '../types';

export async function getClients(tenantId: string, token: string, page: number, limit: number, search?: string): Promise<CommonApiResponse<GetClientsResponse>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) {
    params.append('search', search);
  }
  return httpClient<GetClientsResponse>(`/clients/${tenantId}?${params.toString()}`, { token });
}

export async function getClientsSelectList(tenantId: string, token: string): Promise<CommonApiResponse<SelectListItem[]>> {
  // httpClient now returns CommonApiResponse directly
  return httpClient<SelectListItem[]>(`/clients/${tenantId}/dropdown`, { token });
}

export async function addClient(tenantId: string, token: string, newClient: NewClient): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/clients/${tenantId}`, {
    method: 'POST',
    token,
    data: newClient,
  });
}

export async function getClient(token: string, tenantId: string, clientId: string): Promise<CommonApiResponse<Client>> {
  return httpClient<Client>(`/clients/${tenantId}/${clientId}`, { token });
}

export async function updateClient(tenantId: string, token: string, clientId: string, updatedClient: Partial<NewClient>): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/clients/${tenantId}/${clientId}`, {
    method: 'PUT',
    token,
    data: updatedClient,
  });
}

export async function deleteClient(tenantId: string, token: string, clientId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/clients/${tenantId}/${clientId}`, {
    method: 'DELETE',
    token,
  });
}

export async function resendInvitation(tenantId: string, clientId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/clients/${tenantId}/${clientId}/resend-invitation`, {
    method: 'POST',
  });
}
