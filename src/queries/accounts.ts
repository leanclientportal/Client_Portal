import { getAccounts as fetchAccounts } from '@/lib/api';
import { GetAccountsResponse } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export function getAccounts(token: string | null, userId: string | null | undefined) {
  return useQuery<GetAccountsResponse, Error>({
    queryKey: ['accounts', userId],
    queryFn: () => fetchAccounts(token!, userId!),
    enabled: !!token && !!userId,
  });
}
