'use client';

import { FC, useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { addInvoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, File, UploadCloud } from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import type { NewInvoice, CommonApiResponse, ApiAddResponseData } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';

interface FileWithPreview extends File {
  preview: string;
}

interface AddInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceAdded: () => void;
  projectId: string;
}

const AddInvoiceDialog: FC<AddInvoiceDialogProps> = ({ isOpen, onClose, onInvoiceAdded, projectId }) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('pending');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [paidDate, setPaidDate] = useState<Date | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'paid') {
      setPaidDate(new Date());
    } else {
      setPaidDate(null);
    }
  }, [status]);

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
    }
  });

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!token || !title || !status || !amount || !dueDate || !invoiceDate) {
      toast({ title: "Error", description: "Please fill all mandatory fields (Title, Status, Amount, Due Date, Invoice Date).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = undefined;
      if (files.length > 0) {
        const fileToUpload = files[0];
        const uploadedFile = await uploadFile('invoices', projectId, fileToUpload);
        fileUrl = uploadedFile.downloadURL;
      }

      const invoiceData: NewInvoice = {
        invoiceUrl: fileUrl,
        title,
        status,
        amount: parseFloat(amount),
        dueDate: dueDate.toISOString(),
        invoiceDate: invoiceDate.toISOString(),
        paidDate: status === 'paid' && paidDate ? paidDate.toISOString() : undefined,
        paymentLink: paymentLink || undefined,
      };

      const response: CommonApiResponse<ApiAddResponseData> = await addInvoice(token, projectId, invoiceData);

      if (response.success) {
        toast({ title: "Success", description: response.message || "Invoice added successfully" });
        onInvoiceAdded();
        onClose();
      } else {
        toast({ title: "Error", description: response.message || "Failed to add invoice.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Failed to add invoice:", error);
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
      <DialogContent className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="title">Title*</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount*</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invoiceDate">Invoice Date*</Label>
            <DatePicker selected={invoiceDate} onChange={setInvoiceDate} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status*</Label>
            <Select onValueChange={setStatus} value={status} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === 'paid' && (
            <div className="grid gap-2">
              <Label htmlFor="paidDate">Paid Date*</Label>
              <DatePicker selected={paidDate} onChange={setPaidDate} />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date*</Label>
            <DatePicker selected={dueDate} onChange={setDueDate} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paymentLink">Payment Link (Optional)</Label>
            <Input id="paymentLink" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} />
          </div>
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ?
              <p>Drop the file here ...</p> :
              <p>Drag and drop a file here, or click to select a file (Optional)</p>
            }
          </div>
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
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:gap-2">
          <Button className='mt-2' onClick={onClose} variant="outline">Cancel</Button>
          <Button className='mt-2' variant="secondary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoiceDialog;
