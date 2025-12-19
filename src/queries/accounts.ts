import { getAccounts as fetchAccounts } from '@/lib/api';
import type { CommonApiResponse, GetAccountsResponse } from '@/lib/types'; // Import CommonApiResponse
import { useQuery } from '@tanstack/react-query';

export function getAccounts(token: string | null, userId: string | null | undefined) {
  // Changed the generic type of useQuery to CommonApiResponse<GetAccountsResponse>
  return useQuery<CommonApiResponse<GetAccountsResponse>, Error>({
    queryKey: ['accounts', userId],
    queryFn: () => fetchAccounts(token!, userId!), // fetchAccounts already returns CommonApiResponse<GetAccountsResponse>
    enabled: !!token && !!userId,
  });
}
