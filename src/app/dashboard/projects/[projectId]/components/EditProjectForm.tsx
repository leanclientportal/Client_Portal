'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { getProject, updateProject } from '@/lib/api';
import { Save } from 'lucide-react';
import type { Project, CommonApiResponse, ApiAddResponseData } from '@/lib/types'; // Import CommonApiResponse

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'completed', 'on-hold']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProjectFormProps {
  clientId: string;
  projectId: string;
  onBack: () => void;
}

export default function EditProjectForm({ clientId, projectId, onBack }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [clientName, setClientName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        description: '',
        status: 'active',
    }
  });

  useEffect(() => {
    if (!token || !projectId) return;

    const fetchProjectData = async () => {
      try {
        // Expect CommonApiResponse<Project>
        const response: CommonApiResponse<Project> = await getProject(token, projectId);
        if (response.success && response.data) {
          const project = response.data;
          if (project.isDeleted) {
            setIsDeleted(true);
          } else {
            form.reset({
              name: project.name,
              description: project.description,
              status: project.status,
            });
            if (project.clientId && project.clientId?.name) {
              setClientName(project.clientId?.name);
            }
          }
        } else {
          toast({ title: "Error", description: response.message || "Failed to fetch project data.", variant: "destructive" });
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to fetch project data.", variant: "destructive" });
      } finally {
        // Removed setLoading(false) here, as it's better to control loading at component level
        // or ensure it's handled by the parent if this component is part of a larger loading state
      }
    };

    fetchProjectData();
  }, [token, projectId, form, toast]); // Added form and toast to dependencies

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token) {
      toast({ title: "Error", description: "Required information is missing to update the project.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    await saveProject(data);
  };

  const saveProject = async (data: FormValues) => {
    try {
        // Expect CommonApiResponse<ApiAddResponseData>
        const response: CommonApiResponse<ApiAddResponseData> = await updateProject(token!, projectId, data);
        if (response.success) {
          toast({ title: "Success", description: response.message || "Project updated successfully." });
          router.push(`/dashboard/projects/${projectId}`);
        } else {
          toast({ title: "Error", description: response.message || "Failed to update project.", variant: "destructive" });
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to update project.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  if (isDeleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This project is deleted. Contact administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="clientName" className="md:col-span-3 md:text-right">Client Name</Label>
                <div className="md:col-span-9">
                  <Input id="clientName" value={clientName} disabled />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="name" className="md:col-span-3 md:text-right">Project Name</Label>
                <div className="md:col-span-9">
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="description" className="md:col-span-3 md:text-right">Description</Label>
                <div className="md:col-span-9">
                  <Textarea id="description" {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="status" className="md:col-span-3 md:text-right">Status</Label>
                <div className="md:col-span-9">
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
                </div>
              </div>

              <div className="flex md:justify-end gap-2">
                <Button type="submit" className='text-white bg-blue-600' variant="outline" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
}
