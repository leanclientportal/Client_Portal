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
import { getClients, getTenantsByClient, addProject } from '@/lib/api';
import { Save } from 'lucide-react';
import type { GetClientsResponse, SelectListItem, CommonApiResponse, ApiAddResponseData, NewProject } from '@/lib/types';

const formSchema = z.object({
  ownerId: z.string().min(1, { message: "Owner is required." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'on-hold', 'completed']),
  isDeleted: z.boolean().optional(), // Made optional based on NewProject type
});

type FormValues = z.infer<typeof formSchema>;

interface AddProjectFormProps {
  onBack: () => void;
}

export default function AddProjectForm({ onBack }: AddProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeProfile, activeProfileId, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerId: '',
      name: '',
      description: '',
      status: 'active',
      isDeleted: false,
    },
  });

  useEffect(() => {
    if (!activeProfileId || !token) return;

    const fetchOwners = async () => {
      try {
        if (activeProfile === 'client') {
          const response: CommonApiResponse<SelectListItem[]> = await getTenantsByClient(activeProfileId, token);
          if (response.success && response.data) {
            setOwners(response.data.map(tenant => ({ id: tenant.value, name: tenant.label })));
          } else {
            toast({ title: "Error", description: response.message || "Failed to fetch tenants.", variant: "destructive" });
            setOwners([]);
          }
        } else {
          const response: CommonApiResponse<GetClientsResponse> = await getClients(activeProfileId, token, 1, 100, undefined);
          if (response.success && response.data) {
            setOwners(response.data.clients.map(client => ({ id: client._id, name: client.name })));
          } else {
            toast({ title: "Error", description: response.message || "Failed to fetch clients.", variant: "destructive" });
            setOwners([]);
          }
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to fetch owners.", variant: "destructive" });
        setOwners([]);
      }
    };

    fetchOwners();
  }, [activeProfile, activeProfileId, token, toast]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!activeProfileId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const tenantId = activeProfile === 'tenant' ? activeProfileId : data.ownerId;
    const clientId = activeProfile === 'client' ? activeProfileId : data.ownerId;
    const { ownerId, ...projectData } = data;

    const newProjectPayload: NewProject = { ...projectData, clientId };

    try {
      const response: CommonApiResponse<ApiAddResponseData> = await addProject(tenantId, token, clientId, newProjectPayload);

      if (response.success) {
        toast({ title: "Success", description: response.message || "Project added successfully." });
        router.push('/dashboard/projects');
      } else {
        toast({ title: "Error", description: response.message || "Failed to add project.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <CardHeader className='p-0'>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
        </div>
        <CardContent className='p-0'>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="ownerId" className="md:col-span-3 md:text-right">{activeProfile === 'client' ? 'Tenant' : 'Client'}</Label>
                <div className="md:col-span-9">
                  <Controller
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="ownerId">
                          <SelectValue placeholder={`Select a ${activeProfile === 'client' ? 'tenant' : 'client'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.ownerId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.ownerId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="name" className="md:col-span-3 md:text-right">Project Name</Label>
                <div className="md:col-span-9">
                  <Input id="name" placeholder="E.g. Website Redesign" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <Label htmlFor="description" className="md:col-span-3 md:text-right">Description</Label>
                <div className="md:col-span-9">
                  <Textarea id="description" placeholder="Describe the project" {...form.register("description")} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {isLoading ? 'Saving...' : 'Save Project'}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </div>
    </>
  );
}
