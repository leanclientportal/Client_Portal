'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { updateTask } from '@/lib/api';
import type { NewTask, Task, CommonApiResponse, ApiAddResponseData } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogDescription } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "A due date is required." }),
  status: z.enum(['todo', 'in-progress', 'completed', 'in-review']),
  visibleToClient: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  projectId: string;
  task: Task;
  onTaskUpdated: () => void;
  setOpen: (open: boolean) => void;
}

export default function EditTaskForm({ projectId, task, onTaskUpdated, setOpen }: EditTaskFormProps) {
  const { toast } = useToast();
  const { token, activeProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isClientProfile = activeProfile === 'client';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...task,
      dueDate: new Date(task.dueDate),
    },
  });

  const { control, register } = form;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const taskData: Partial<NewTask> = {
      ...data,
      description: data.description || '',
      dueDate: data.dueDate.toISOString(),
    };

    try {
      const response: CommonApiResponse<ApiAddResponseData> = await updateTask(token, projectId, task._id, taskData);
      if (response.success) {
        toast({ title: "Success", description: response.message || "Task updated successfully." });
        onTaskUpdated();
        setOpen(false);
      } else {
        toast({ title: "Error", description: response.message || "Failed to update task.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update task.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <DialogDescription />
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 ">
        <div className="grid gap-2">
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" placeholder="E.g. Design homepage mockup" {...register("title")} />
          {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe the task in more detail" {...register("description")} />
          {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                placeholderText="Select due date"
              />
            )}
          />
          {form.formState.errors.dueDate && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.dueDate.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.status && <p className="text--500 text-xs mt-1">{form.formState.errors.status.message}</p>}
        </div>

        {!isClientProfile && (
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="visibleToClient"
                render={({ field }) => (
                  <Switch
                    id="visibleToClient"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="visibleToClient">Visible to Client</Label>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating Task...' : 'Update Task'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
