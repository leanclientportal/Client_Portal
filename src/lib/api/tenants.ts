// src/lib/api/tenants.ts

import { httpClient } from './http-client';
import type {
  SelectListItem,
  CommonApiResponse,
} from '../types';

export async function getTenantsByClient(clientId: string, token: string): Promise<CommonApiResponse<SelectListItem[]>> {
  return httpClient<SelectListItem[]>(`/tenant/by-client/${clientId}`, { token });
}
