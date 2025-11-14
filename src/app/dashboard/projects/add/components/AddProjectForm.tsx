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
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { getClients, getTenantsByClient, addProject } from '@/lib/api';
import type { NewProject } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  ownerId: z.string().min(1, { message: "Owner is required." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'on-hold', 'completed']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProjectForm() {
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
      isActive: true,
    },
  });

  useEffect(() => {
    if (!activeProfileId || !token) return;

    const fetchOwners = async () => {
      try {
        if (activeProfile === 'client') {
          const tenants = await getTenantsByClient(activeProfileId, token);
          setOwners(tenants.map(tenant => ({ id: tenant.id, name: tenant.name })));
        } else {
          const { clients } = await getClients(activeProfileId, token, 1, 100);
          setOwners(clients.map(client => ({ id: client._id, name: client.name })));
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch owners.", variant: "destructive" });
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

    try {
      await addProject(tenantId, token, clientId, { ...data, clientId });
      toast({ title: "Success", description: "Project added successfully." });
      router.push('/dashboard/projects');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add project.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="ownerId">{activeProfile === 'client' ? 'Tenant' : 'Client'}</Label>
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

              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="E.g. Website Redesign" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the project" {...form.register("description")} />
                {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
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

              <div className="flex items-center space-x-2">
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isActive">Project is active</Label>
              </div>


              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
}
