'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { createProfile, updateProfile } from '@/lib/api';
import type { NewProfile, Account, CommonApiResponse, CreateProfileResponse } from '@/lib/types';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { uploadImageAndGetURL } from '@/lib/storage';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

const formSchema = z.object({
  profileType: z.enum(['client', 'tenant'] as const),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().refine(val => !val || isValidPhoneNumber(val), { message: "Invalid phone number." }).optional(),
  profileImageBinary: z.string().optional(),
  profileImageName: z.string().optional(),
});

interface AddProfileFormProps {
  account?: Account;
}

export default function AddProfileForm({ account }: AddProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { userId, activeProfileId, token } = useAuth();
  const isEditMode = !!account;
  const [imagePreview, setImagePreview] = useState<string | null>(account?.profileImageUrl || null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: account?.type || 'client',
      name: account?.name || '',
      email: account?.email || '',
      phone: account?.phone || '',
      profileImageBinary: '',
      profileImageName: '',
    },
  });

  const { formState: { isDirty, errors }, watch } = form;
  const name = watch('name');

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleBackClick = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (account) {
      form.reset({
        profileType: account.type,
        name: account.name,
        email: account.email,
        phone: account.phone || '',
      });
      if (account.profileImageUrl) {
        setImagePreview(account.profileImageUrl);
      }
    }
  }, [account, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue('profileImageBinary', base64String, { shouldValidate: true });
        form.setValue('profileImageName', file.name, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('profileImageBinary', '', { shouldValidate: true });
      form.setValue('profileImageName', '', { shouldValidate: true });
      setImagePreview(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId || !token) {
      toast({ title: 'Error', description: 'Authentication details are missing. Please log in again.', variant: 'destructive' });
      return;
    }

    try {
      let profileImageUrl = account?.profileImageUrl;
      const { profileImageBinary, profileImageName, ...profileDetails } = values;

      if (profileImageBinary && profileImageName) {
        profileImageUrl = await uploadImageAndGetURL(activeProfileId!, profileImageBinary, profileImageName);
      }

      const profileData: NewProfile = {
        ...profileDetails,
        phone: profileDetails.phone || null, // Convert undefined or empty string to null
        profileImageUrl
      };

      let response: CommonApiResponse<CreateProfileResponse>;

      if (isEditMode && account) {
        response = await updateProfile(userId, token, account.id, profileData);
      } else {
        response = await createProfile(userId, token, profileData);
      }

      if (response.success) {
        toast({ title: 'Success', description: `Profile ${isEditMode ? 'updated' : 'created'} successfully.` });
        router.push('/dashboard/switch-profile');
      } else {
        toast({ title: 'Error', description: response.message || `Failed to ${isEditMode ? 'update' : 'create'} profile.`, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'An unexpected error occurred.', variant: 'destructive' });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview!} alt="Profile Preview" />
                <AvatarFallback>{name ? getInitials(name) : ''}</AvatarFallback>
              </Avatar>
              <div>
                <Input type="file" onChange={handleFileChange} accept="image/*" />
                {errors.profileImageBinary && <p className="text-red-500 text-xs mt-1">{errors.profileImageBinary.message}</p>}
              </div>
            </div>

            {isEditMode && account ? (
              <div className="text-right">
                <Badge variant="outline" className="capitalize">{account.type}</Badge>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="profileType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex justify-end items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="client" />
                          </FormControl>
                          <FormLabel className="font-normal">Client</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="tenant" />
                          </FormControl>
                          <FormLabel className="font-normal">Tenant</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormControl><Input placeholder="Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormControl><Input placeholder="Email" {...field} readOnly={isEditMode} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormControl><PhoneInput placeholder="Enter phone number" inputComponent={Input} {...field} /></FormControl><FormMessage /></FormItem>)} />

          <div className="flex gap-2">
            <Button type="submit">{isEditMode ? 'Update' : 'Submit'}</Button>
            <Button type="button" variant="outline" onClick={handleBackClick}>Back</Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to leave? Your changes will be discarded.</AlertDialogDescription>
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
