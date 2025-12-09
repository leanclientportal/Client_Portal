'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { updateClient, resendInvitation } from '@/lib/api';
import { uploadImageAndGetURL } from '@/lib/storage';
import type { Client, NewClient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarImage } from '@/components/ui/avatar';

// Validation schema for updating a client
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().refine(val => !val || isValidPhoneNumber(val), {
    message: "Invalid phone number."
  }).optional(),
  profileImageBinary: z.string().optional(),
  profileImageName: z.string().optional(),
});

interface EditClientFormProps {
  client: Client;
}

export default function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter();
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<NewClient>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
    }
  });

  const { formState: { isDirty } } = form;

  const handleBackClick = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('profileImageBinary', base64String, { shouldDirty: true });
        form.setValue('profileImageName', file.name, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResendInvitation = async () => {
    if (!tenantId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }
    try {
      let respon = await resendInvitation(tenantId, client._id);
      toast({ title: "Success", description: respon.message });
      router.push(`/dashboard/clients/${client._id}/edit`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to resend invitation.", variant: "destructive" });
    }
  };

  const onSubmit: SubmitHandler<NewClient> = async (data) => {
    if (!tenantId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      let profileImageUrl: string | undefined = undefined;
      const { profileImageBinary, profileImageName, ...clientDetails } = data;

      if (profileImageBinary && profileImageName) {
        profileImageUrl = await uploadImageAndGetURL(tenantId, profileImageBinary, profileImageName);
      }

      const updatedClientData = {
        ...clientDetails,
        ...(profileImageUrl && { profileImageUrl }),
      };

      const response = await updateClient(tenantId, token, client._id, updatedClientData);
      if (response.success && data.email !== client.email) {
        await handleResendInvitation();
      }
      toast({ title: "Success", description: response.message });
      router.push('/dashboard/clients');
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between mb-6">
            <CardTitle>Client Details</CardTitle>
            {client && client.invitationToken && (
              <div className="text-sm text-white-500 bg-yellow-500 py-1 px-4 rounded-full">
                Invitation Acceptance Pending
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Profile Preview" width={96} height={96} className="object-cover" />
                  ) : (
                    <Avatar>
                      <AvatarImage src={client.profileImageUrl || '/images/default-profile.png'} alt="Profile Preview" width={96} height={96} className="object-cover" />
                    </Avatar>
                  )}
                </div>
                <Input type="file" onChange={handleFileChange} accept="image/*" />
              </div>

              <div>
                <Input placeholder="Name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Input placeholder="Email" {...form.register("email")} disabled={!client.invitationToken} />
                {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
              </div>

              <div>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field }) => (
                    <PhoneNumberInput
                      {...field}
                      defaultCountry="US"
                      placeholder="Phone number"
                    />
                  )}
                />
                {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
              </div>

              <div className="flex gap-3">
                {client.invitationToken && (
                  <Button type="button" className='bg-yellow-600' variant="outline" onClick={handleResendInvitation}>
                    Resend Invitation
                  </Button>
                )}
                <Button type="submit" className='text-white-500 bg-blue-600' variant="outline" disabled={isLoading}>
                  {isLoading ? 'Updating Client...' : 'Update Client'}
                </Button>

                <Button type="button" variant="outline" onClick={handleBackClick}>
                  Back
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
