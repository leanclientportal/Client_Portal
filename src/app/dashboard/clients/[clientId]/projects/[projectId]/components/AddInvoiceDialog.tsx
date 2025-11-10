'use client';

import { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUploaded: () => void;
  projectId: string;
}

export default function AddInvoiceDialog({ isOpen, onClose, onInvoiceUploaded, projectId }: AddInvoiceDialogProps) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('due');
  const [paymentLink, setPaymentLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDueDate('');
    setStatus('due');
    setPaymentLink('');
    setSelectedFile(null);
  }

  const handleUpload = async () => {
    if (!amount || !dueDate || !status) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    if (selectedFile) {
        formData.append('file', selectedFile);
    }
    formData.append('amount', amount);
    formData.append('dueDate', dueDate);
    formData.append('status', status);
    formData.append('paymentLink', paymentLink);
    formData.append('projectId', projectId);


    try {
      const response = await fetch(`/api/projects/${projectId}/invoices`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invoice upload failed');
      }

      toast({ title: 'Invoice uploaded', description: 'The invoice has been successfully uploaded.' });
      onInvoiceUploaded();
      resetForm();
      onClose();
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Could not upload invoice. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="due">Due</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="paymentLink">Payment Link</Label>
                <Input id="paymentLink" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="Optional: https://..." />
            </div>
            <div className="space-y-2">
                <Label htmlFor="file">File (Optional)</Label>
                <Input id="file" type="file" onChange={handleFileChange} />
                  {selectedFile && (
                  <div className="text-sm text-muted-foreground pt-2">
                    {selectedFile.name} selected
                  </div>
                )}
            </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !amount || !dueDate || !status}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUploading ? 'Uploading...' : 'Add Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
