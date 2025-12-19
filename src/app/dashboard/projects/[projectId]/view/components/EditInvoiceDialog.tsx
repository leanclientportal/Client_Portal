'use client';

import { FC, useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { updateInvoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, File, UploadCloud } from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import type { NewInvoice, Invoice, CommonApiResponse, ApiAddResponseData } from '@/lib/types'; // Updated imports
import { format } from 'date-fns';

interface FileWithPreview extends File {
  preview: string;
}

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated: () => void;
  projectId: string;
  invoice: Invoice;
}

const safeFormatDate = (dateString?: string): string => {
    if (dateString) {
        const date = new Date(dateString);
        if (date instanceof Date && !isNaN(date.getTime())) {
            return format(date, 'yyyy-MM-dd');
        }
    }
    return '';
};

export default function EditInvoiceDialog({ projectId, invoice, onInvoiceUpdated, isOpen, onClose }: EditInvoiceDialogProps) {

  const { token, activeProfile } = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  const isClient = activeProfile === 'client';

  const [title, setTitle] = useState(invoice.title);
  const [status, setStatus] = useState(invoice.status);
  const [amount, setAmount] = useState(invoice.amount.toString());
  const [dueDate, setDueDate] = useState(safeFormatDate(invoice.dueDate));
  const [invoiceDate, setInvoiceDate] = useState(safeFormatDate(invoice.invoiceDate));
  const [paidDate, setPaidDate] = useState<string | undefined>(
    safeFormatDate(invoice.paidDate) || undefined
  );
  const [paymentLink, setPaymentLink] = useState(invoice.paymentLink || '');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'paid') {
      setPaidDate(today);
    } else {
      setPaidDate(undefined);
    }
  }, [status, paidDate, today]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    disabled: isClient
  });

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isClient || !token || !title || !status || !amount || !dueDate || !invoiceDate) {
      toast({ title: "Error", description: "Please fill all mandatory fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = invoice.invoiceUrl;
      if (files.length > 0) {
        const fileToUpload = files[0];
        const uploadedFile = await uploadFile('invoices', projectId, fileToUpload);
        fileUrl = uploadedFile.downloadURL;
      }

      const invoiceData: Partial<NewInvoice> = {
        invoiceUrl: fileUrl,
        title,
        status,
        amount: parseFloat(amount),
        dueDate,
        invoiceDate,
        paidDate: status === 'paid' ? paidDate : undefined,
        paymentLink: paymentLink || undefined,
      };

      const response: CommonApiResponse<ApiAddResponseData> = await updateInvoice(token, projectId, invoice._id, invoiceData); // Explicitly type the response

      if (response.success) {
        toast({ title: "Success", description: response.message || "Invoice updated successfully" });
        onInvoiceUpdated();
        onClose();
      } else {
        toast({ title: "Error", description: response.message || "Failed to update invoice.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Failed to update invoice:", error);
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
    }
  };

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
      }
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isClient ? 'View Invoice' : 'Edit Invoice'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title*</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required disabled={isClient} />
          </div>
         
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount*</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" required disabled={isClient} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="invoiceDate" className="text-right">Invoice Date*</Label>
            <Input id="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="col-span-3" required disabled={isClient} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status*</Label>
            <Select onValueChange={setStatus} value={status} required disabled={isClient}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === 'paid' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paidDate" className="text-right">Paid Date*</Label>
              <Input id="paidDate" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} className="col-span-3" required disabled={isClient} />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">Due Date*</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="col-span-3" required disabled={isClient} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentLink" className="text-right">Payment Link (Optional)</Label>
            <Input id="paymentLink" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} className="col-span-3" disabled={isClient} />
          </div>
          {!isClient && (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              {isDragActive ?
                <p>Drop the file here ...</p> :
                <p>Drag and drop a file here, or click to select a file (Optional)</p>
              }
            </div>
          )}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Selected File:</h4>
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') ? (
                        <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded-md" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <span>{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {invoice.invoiceUrl && files.length === 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Current Invoice File:</h4>
              <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View Current Invoice
              </a>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          {!isClient && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
