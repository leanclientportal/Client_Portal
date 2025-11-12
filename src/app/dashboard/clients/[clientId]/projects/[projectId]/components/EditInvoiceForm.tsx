'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  dueDate: z.string(),
  status: z.enum(['due', 'paid', 'overdue']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditInvoiceFormProps {
  invoice: any;
  projectId: string;
  onInvoiceUpdated: () => void;
  setOpen: (open: boolean) => void;
}

export default function EditInvoiceForm({ invoice, projectId, onInvoiceUpdated, setOpen }: EditInvoiceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      status: invoice.status,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invoice update failed');
      }

      toast({ title: 'Invoice updated', description: 'The invoice has been successfully updated.' });
      onInvoiceUpdated();
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message || 'Could not update invoice. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...form.register("dueDate")} />
            {form.formState.errors.dueDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dueDate.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                </Select>
                )}
            />
            {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
            </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
