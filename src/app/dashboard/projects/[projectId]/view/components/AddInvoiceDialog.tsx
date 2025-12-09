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
import { NewInvoice } from '@/lib/types';

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
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!token || files.length === 0 || !amount || !dueDate || !title || !status) {
      toast({ title: "Error", description: "Please fill all required fields and select a file.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const fileToUpload = files[0];
      const fileUrl = await uploadFile('invoices', projectId, fileToUpload);

      const invoiceData: NewInvoice = {
        invoiceUrl: fileUrl.downloadURL,
        title,
        description,
        status,
        amount: parseFloat(amount),
        dueDate,
        paymentLink,
      };

      const response = await addInvoice(token, projectId, invoiceData);

      toast({ title: "Success", description: response.message || "Invoice added successfully" });
      onInvoiceAdded();
      onClose();
    } catch (error: any) {
      console.error("Failed to add invoice:", error);
      toast({ title: "Error", description: error.message || "Failed to add invoice", variant: "destructive" });
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
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">Due Date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentLink" className="text-right">Payment Link</Label>
            <Input id="paymentLink" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} className="col-span-3" />
          </div>
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ?
              <p>Drop the file here ...</p> :
              <p>Drag and drop a file here, or click to select a file</p>
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
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || files.length === 0}>
            {isSubmitting ? 'Adding...' : 'Add Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoiceDialog;
