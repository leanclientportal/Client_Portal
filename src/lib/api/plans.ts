// src/lib/api/plans.ts

import { httpClient } from './http-client';
import type {
  Plan,
  GetPlansResponse,
  CommonApiResponse,
} from '../types';

export async function getPlans(token: string): Promise<CommonApiResponse<GetPlansResponse>> {
  return httpClient<GetPlansResponse>(`/plans`, { token });
}
