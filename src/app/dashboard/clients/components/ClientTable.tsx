'use client';

import { useEffect, useState, FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getClients, deleteClient } from '@/lib/api';
import { startConversation } from '@/lib/api/chat';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Client, Pagination, CommonApiResponse, GetClientsResponse } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, ArrowUpDown, Trash2, MessageSquare } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute flex h-full w-full items-center justify-center opacity-100 transition-opacity duration-300 group-hover/action:opacity-0">
        {children}
      </div>
      <div className="absolute flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover/action:opacity-100">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
    </button>
  );
};

const CLIENTS_PER_PAGE = 10;

type SortKey = keyof Client | '';

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('lastActivityDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const fetchClients = async (searchText: string = "") => {
    if (!tenantId || !token) return;
    try {
      setLoading(true);

      // Updated to use CommonApiResponse
      const response: CommonApiResponse<GetClientsResponse> = await getClients(
        tenantId,
        token,
        currentPage,
        CLIENTS_PER_PAGE,
        searchText
      );

      if (response.success) {
        setClients(response.data?.clients || []); // Access clients from response.data
        setPagination(response.pagination || null); // Access pagination from response
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch clients');
        setClients([]);
        setPagination(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clients');
      setClients([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(filterValue);
  }, [tenantId, token, currentPage, filterValue]); 

  const handleDeleteClient = async () => {
    if (!tenantId || !token || !deleteClientId) return;

    try {
      // Updated to use CommonApiResponse
      const response: CommonApiResponse<any> = await deleteClient(tenantId, token, deleteClientId);

      if (response.success) {
        toast({ title: response.message || 'Client deleted successfully' });
        fetchClients(); // Refetch clients after deletion
      } else {
        toast({ title: response.message || 'Error deleting client', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: error.message || 'Error deleting client', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteClientId(null);
    }
  };

  const handleStartChat = async (client: Client) => {
    if (!tenantId || !token) return;
    router.push(`/dashboard/chat?conversationId=${client._id}`);
  };

  const handleFilter = () => {
    if (searchTerm.length > 0 && searchTerm.length <= 2) {
        toast({ title: 'Please enter at least 3 characters to search.' });
    } else {
        setCurrentPage(1);
        setFilterValue(searchTerm);
    }
  };

  const sortedClients = useMemo(() => {
    if (!sortKey) return clients;

    return [...clients].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (sortKey === 'lastActivityDate') {
        const dateA = aValue ? new Date(aValue as string).getTime() : 0;
        const dateB = bValue ? new Date(bValue as string).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortKey === 'totalProjects') {
        const numA = (aValue as number) ?? 0;
        const numB = (bValue as number) ?? 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [clients, sortKey, sortDirection]);


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handlePreviousPage = () => {
    if (pagination && pagination.current > 1) {
      setCurrentPage(pagination.current - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.current < pagination.total) {
      setCurrentPage(pagination.current + 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  const getProjectCountBadgeClasses = (count: number) => {
    if (count === 0) {
      return 'bg-gray-500 text-white';
    } else if (count > 0 && count <= 5) {
      return 'bg-blue-500 text-white';
    } else if (count > 5 && count <= 10) {
      return 'bg-green-500 text-white';
    } else {
      return 'bg-purple-500 text-white';
    }
  };

  const SortableHeader: FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey: key, children }) => (
    <TableHead onClick={() => handleSort(key)} className="cursor-pointer">
      <div className="flex items-center">
        {children}
        {sortKey === key && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </TableHead>
  );

  return (
    <>
      <div className="flex items-center mb-4 space-x-2">
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleFilter}>Filter</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <SortableHeader sortKey="name">Name</SortableHeader>
            <SortableHeader sortKey="email">Email</SortableHeader>
            <SortableHeader sortKey="phone">Phone</SortableHeader>
            <SortableHeader sortKey="totalProjects">Total Projects</SortableHeader>
            <SortableHeader sortKey="lastActivityDate">Last Activity</SortableHeader>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClients.length > 0 ? (
            sortedClients.map(client => (
              <TableRow key={client._id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={client.profileImageUrl} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  {client.name}
                  {client.invitationToken && (
                    <div className="text-xs text-red-500">Invitation Acceptance Pending</div>
                  )}
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center p-0",
                    getProjectCountBadgeClasses(client.totalProjects)
                  )}>
                    {client.totalProjects}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(client.lastActivityDate)}</TableCell>
                <TableCell className="text-right">
                  <div
                    className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => handleStartChat(client))}
                      label="Chat"
                      className="text-green-500 hover:bg-green-500"
                    >
                      <MessageSquare className="h-[22px] w-[22px]" />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/projects?clientId=${client._id}`))}
                      label="Projects"
                      className="text-blue-500 hover:bg-blue-500"
                    >
                      <Eye className="h-[22px] w-[22px]" />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${client._id}/edit`))}
                      label="Edit"
                      className="text-yellow-500 hover:bg-yellow-500"
                    >
                      <Edit className="h-[22px] w-[22px]" />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => {
                        setDeleteClientId(client._id);
                        setIsDeleteDialogOpen(true);
                      })}
                      label="Trash"
                      className="text-red-500 hover:bg-red-500"
                    >
                      <Trash2 className="h-[22px] w-[22px]" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No clients found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Page {pagination.current} of {pagination.total}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.current >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this client and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
