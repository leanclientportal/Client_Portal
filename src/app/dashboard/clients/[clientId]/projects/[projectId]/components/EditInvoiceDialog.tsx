'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditInvoiceForm from './EditInvoiceForm';

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated: () => void;
  invoice: any;
  projectId: string;
}

export default function EditInvoiceDialog({ isOpen, onClose, onInvoiceUpdated, invoice, projectId }: EditInvoiceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        <EditInvoiceForm 
          invoice={invoice}
          projectId={projectId}
          onInvoiceUpdated={() => {
            onInvoiceUpdated();
            onClose();
          }}
          setOpen={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
