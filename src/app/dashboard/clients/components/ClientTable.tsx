'use client';

import { useEffect, useState, FC } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Client, Pagination } from '@/lib/types';
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
import { Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!tenantId || !token) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        const { clients: fetchedClients, pagination: newPagination } = await getClients(
          tenantId,
          token,
          currentPage,
          CLIENTS_PER_PAGE
        );

        const processedClients = fetchedClients.map(client => {
          return { ...client };
        });

        setClients(processedClients);
        setPagination(newPagination);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [tenantId, token, currentPage]);

  const handleClientDeleted = (clientId: string) => {
    setClients(currentClients => currentClients.filter(c => c._id !== clientId));
  };

  const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToDelete(client);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete || !tenantId || !token) return;

    setIsDeleting(true);
    try {
      await deleteClient(tenantId, token, clientToDelete._id);
      toast({ title: "Success", description: "Client deleted successfully." });
      handleClientDeleted(clientToDelete._id);
      setClientToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete client.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map(client => (
              <TableRow key={client._id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={client.profileImageUrl} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div
                    className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${client._id}/projects`))}
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
                      onClick={(e) => handleDeleteClick(e, client)}
                      label="Delete"
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
              <TableCell colSpan={5} className="text-center">No clients found.</TableCell>
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
      <AlertDialog open={!!clientToDelete} onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
