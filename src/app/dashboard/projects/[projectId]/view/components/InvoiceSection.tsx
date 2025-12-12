'use client';

import { FC, useState, useMemo, MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Paperclip, Loader2, Download, Edit, Trash2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import AddInvoiceDialog from './AddInvoiceDialog';
import EditInvoiceDialog from './EditInvoiceDialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { deleteInvoice, markInvoiceAsPaid } from '@/lib/api';
import type { Invoice } from '@/lib/types';
import { capitalizeFirstLetter, cn } from '@/lib/utils';
import { ActionButton } from './ActionButton'; // Assuming ActionButton is also extracted
import { isPast, isToday, isFuture, addDays, format } from 'date-fns'; // Import date-fns utilities
import { Badge } from '@/components/ui/badge'; // Import Badge component

interface InvoiceSectionProps {
  projectId: string;
  projectInvoices: Invoice[];
  isLoadingInvoices: boolean;
  fetchInvoices: () => Promise<void>;
  activeProfile: string | null;
}

const InvoiceSection: FC<InvoiceSectionProps> = ({ projectId, projectInvoices, isLoadingInvoices, fetchInvoices, activeProfile }) => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [isAddInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceToPaid, setInvoiceToPaid] = useState<Invoice | null>(null);
  const [isPaidInvoice, setIsPaidInvoice] = useState(false);

  const [invoiceSortKey, setInvoiceSortKey] = useState<keyof Invoice>('invoiceDate'); // Changed default sort key to 'invoiceDate'
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<'asc' | 'desc'>('desc'); // Changed default sort order to 'desc'

  const handleDownload = (downloadUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const sortedInvoices = useMemo(() => {
    const sorted = [...projectInvoices].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (invoiceSortKey === 'dueDate' || invoiceSortKey === 'createdAt' || invoiceSortKey === 'invoiceDate') {
        aValue = new Date(a[invoiceSortKey]).getTime();
        bValue = new Date(b[invoiceSortKey]).getTime();
      } else if (invoiceSortKey === 'amount') {
        aValue = a[invoiceSortKey];
        bValue = b[invoiceSortKey];
      } else {
        aValue = (a[invoiceSortKey] || '').toString().toLowerCase();
        bValue = (b[invoiceSortKey] || '').toString().toLowerCase();
      }

      if (aValue < bValue) {
        return invoiceSortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return invoiceSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [projectInvoices, invoiceSortKey, invoiceSortOrder]);

  const handleInvoiceSort = (key: keyof Invoice) => {
    if (invoiceSortKey === key) {
      setInvoiceSortOrder(invoiceSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setInvoiceSortKey(key);
      setInvoiceSortOrder('asc');
    }
  };

  const handleDeleteInvoiceClick = (e: MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToDelete(invoice);
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!invoiceToDelete || !token) return;
    setIsDeletingInvoice(true);
    try {
      const response = await deleteInvoice(token, projectId, invoiceToDelete._id);
      toast({ title: "Success", description: response.message || "Invoice deleted successfully" });
      fetchInvoices();
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const handleEditInvoiceClick = (e: MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToEdit(invoice);
  };

  const handlePaidInvoiceClick = (e: MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToPaid(invoice);
  };

  const handleConfirmMarkPaidTask = async () => {
    if (!invoiceToPaid || !token) return;
    setIsPaidInvoice(true);
    try {
      const response = await markInvoiceAsPaid(token, projectId, invoiceToPaid._id);
      toast({ title: "Success", description: response.message || "Invoice paid successfully" });
      fetchInvoices();
      setInvoiceToPaid(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to paid invoice.", variant: "destructive" });
    } finally {
      setIsPaidInvoice(false);
    }
  };

  const getInvoiceDueDateStatus = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);

    if (isPast(dueDate) && !isToday(dueDate)) {
      return { label: 'Overdue', variant: 'destructive' };
    } else if ((isToday(dueDate) || isFuture(dueDate) && dueDate <= sevenDaysFromNow) && dueDate.getTime() >= today.setHours(0,0,0,0)) {
        return { label: 'Due Soon', variant: 'warning' };
    }
    return null;
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoices</CardTitle>
          <Dialog open={isAddInvoiceOpen} onOpenChange={setAddInvoiceOpen}>
            <DialogTrigger asChild>
              {activeProfile !== "client" && (
                <Button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Add Invoice
                </Button>
              )}
            </DialogTrigger>
            <AddInvoiceDialog
              isOpen={isAddInvoiceOpen}
              onClose={() => setAddInvoiceOpen(false)}
              onInvoiceAdded={() => {
                fetchInvoices();
                setAddInvoiceOpen(false);
              }}
              projectId={projectId}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingInvoices ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleInvoiceSort('title')}>
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleInvoiceSort('amount')}>
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleInvoiceSort('status')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleInvoiceSort('invoiceDate')}>
                    Invoice Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleInvoiceSort('dueDate')}>
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.length > 0 ? sortedInvoices.map((invoice, index) => {
                const dueDateStatus = getInvoiceDueDateStatus(invoice.dueDate);
                return (
                  <TableRow key={invoice._id || index}>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{capitalizeFirstLetter(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {dueDateStatus && (
                          <Badge variant={dueDateStatus.variant as 'default' | 'secondary' | 'outline' | 'destructive' | 'warning'}>
                            {dueDateStatus.label}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">
                        {invoice.invoiceUrl && (
                          <ActionButton
                            onClick={() => handleDownload(invoice.invoiceUrl, invoice.title || `invoice-${invoice._id}`)}
                            label="Download"
                            className="text-blue-500 hover:bg-blue-500"
                          >
                            <Download className="h-5 w-5" />
                          </ActionButton>
                        )}
                        {activeProfile !== 'client' && (
                          <>
                            {invoice.status !== 'paid' && (
                              <ActionButton
                                onClick={(e) => handlePaidInvoiceClick(e, invoice)}
                                label="Mark As Paid"
                                className="text-green-500 hover:bg-green-500"
                              >
                                <Save className="h-5 w-5" />
                              </ActionButton>
                            )}
                            <ActionButton
                              onClick={(e) => handleEditInvoiceClick(e, invoice)}
                              label="Edit"
                              className="text-yellow-500 hover:bg-yellow-500"
                            >
                              <Edit className="h-5 w-5" />
                            </ActionButton>
                            <ActionButton
                              onClick={(e) => handleDeleteInvoiceClick(e, invoice)}
                              label="Delete"
                              className="text-red-500 hover:bg-red-500"
                            >
                              <Trash2 className="h-5 w-5" />
                            </ActionButton>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No invoices found for this project.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {invoiceToEdit && (
        <Dialog open={!!invoiceToEdit} onOpenChange={(isOpen) => !isOpen && setInvoiceToEdit(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            <EditInvoiceDialog
              projectId={projectId}
              invoice={invoiceToEdit}
              onInvoiceUpdated={() => {
                fetchInvoices();
                setInvoiceToEdit(null);
              }}
              onClose={() => setInvoiceToEdit(null)}
              isOpen={!!invoiceToEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!invoiceToPaid} onOpenChange={(isOpen) => !isOpen && setInvoiceToPaid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to mark this invoice as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Once you confirm, the invoice status will be updated to “Paid”. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMarkPaidTask} disabled={isPaidInvoice}>
              {isPaidInvoice ? 'Marking as paid...' : 'Mark as Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(isOpen) => !isOpen && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteInvoice} disabled={isDeletingInvoice}>
              {isDeletingInvoice ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default InvoiceSection;