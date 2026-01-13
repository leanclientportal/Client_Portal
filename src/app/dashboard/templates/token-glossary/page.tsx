
'use client';
import { useState, useEffect, useCallback, FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getTokenGlossary } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { CommonApiResponse, Template } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { TokenGlossary, TokenGlossaryResponse } from '@/models/tokenglossary';
import { Input } from '@/components/ui/input';
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp';

export default function TokenGlossaryPage() {
  const { activeProfileId: tenantId, token } = useAuth();

  const { toast } = useToast();
  const [tokenGlossary, setTokenGlossary] = useState<TokenGlossary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchTokenGlossary = useCallback(async () => {
    if (!tenantId || !token) return;
    setIsLoading(true);
    try {
      const response: CommonApiResponse<TokenGlossaryResponse> = await getTokenGlossary(token);
      if (response.success && response.data) {
        setTokenGlossary(response.data?.tokenGlossary);
        toast({
          title: 'Success',
          description: response.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to load token glossary'
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load token glossary.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, token, toast]);

  useEffect(() => {
    fetchTokenGlossary();
  }, [fetchTokenGlossary]);

  const filteredTokenGlossary = tokenGlossary.filter(item =>
    item.category.toLowerCase().includes(filter.toLowerCase()) ||
    item.token.toLowerCase().includes(filter.toLowerCase()) ||
    item.description.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Email Templates" },
  ];
  return (
    <>
      <BreadcrumbComp title="Token Glossary" items={BCrumb} />
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Filter..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Token name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTokenGlossary.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.token}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
