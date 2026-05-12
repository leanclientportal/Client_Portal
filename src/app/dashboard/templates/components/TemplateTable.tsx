'use client';

import { useState, useEffect, useCallback, FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getTemplates, deleteTemplate } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Template } from '@/lib/types';
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
import { Edit, Eye, Filter, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';

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

export function TemplateTable() {
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!tenantId || !token) return;
    setIsLoading(true);
    try {
      const res = await getTemplates(tenantId, token, 1, 10);
      if (res.success && res.data)
        setTemplates(res.data?.templates);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load templates.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, token, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async () => {
    if (!tenantId || !token || !deleteTemplateId) return;
    try {
      const response = await deleteTemplate(tenantId, deleteTemplateId, token);
      toast({
        title: 'Success',
        description: response.message,
      });
      fetchTemplates();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete template.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTemplateId(null);
    }
  };

  const handleEdit = (template: Template) => {
    router.push(`/dashboard/templates/edit/${template._id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  return (
    <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Left side: Search + Filter */}
        <div className="flex items-center gap-2">

          <Link href="/dashboard/templates/token-glossary">
            <Button variant="outline" className="mr-2">
          <Eye className="mr-2 h-4 w-4" />
              View Token Glossary</Button>
          </Link>
        </div>
        <Link href="/dashboard/templates/add">
          <Button>Add Template</Button>
        </Link>
      </div>



      <div className="mt-3 overflow-x-auto">
        <div className="space-y-4">
          <div className="flex justify-end">

          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Name</TableHead>
                <TableHead>Template Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length > 0 ? (
                templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.templateTypeName}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell className="text-right">
                      <div
                        className="inline-flex justify-end items-center gap-1 rounded-full p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionButton
                          onClick={(e) => handleActionClick(e, () => handleEdit(template))}
                          label="Edit"
                          className="text-yellow-500 hover:bg-yellow-500"
                        >
                          <Edit className="h-[22px] w-[22px]" />
                        </ActionButton>
                        <ActionButton
                          onClick={(e) => handleActionClick(e, () => {
                            setDeleteTemplateId(template._id);
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
                  <TableCell colSpan={4} className="text-center">No templates found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
