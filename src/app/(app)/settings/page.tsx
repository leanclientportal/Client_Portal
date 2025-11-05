'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateUser } from '@/queries/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { name, email } = useAuth();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: name || '',
      email: email || '',
    },
  });

  const onSubmit = (data: FormValues) => {
    updateUser(data, {
      onSuccess: () => {
        toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
      },
      onError: () => {
        toast({ title: 'Update Failed', description: 'Could not update your profile. Please try again.', variant: 'destructive' });
      },
    });
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="max-w-md" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Input {...register('name')} placeholder="Name" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div className="mb-6">
              <Input {...register('email')} placeholder="Email" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
