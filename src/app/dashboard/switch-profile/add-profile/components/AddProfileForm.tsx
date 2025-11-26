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
import { NewProfile, Account } from '@/lib/types';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { uploadImageAndGetURL } from '@/lib/storage';

const formSchema = z.object({
  profileType: z.enum(['client', 'tenant'] as const),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),
  phone: z.string().refine(val => !val || isValidPhoneNumber(val), {
    message: "Invalid phone number."
  }).optional(),
  profileImage: z.any().optional(),
});

interface AddProfileFormProps {
  account?: Account;
}

export default function AddProfileForm({ account }: AddProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { activeProfileId, token } = useAuth();
  const isEditMode = !!account;
  const [imagePreview, setImagePreview] = useState<string | null>(account?.profileImageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: account?.type || 'client',
      name: account?.name || '',
      email: account?.email || '',
      phone: account?.phone || '',
    },
  });

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeProfileId || !token) {
      toast({
        title: 'Error',
        description: 'Authentication details are missing. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let profileImageUrl = account?.profileImageUrl;
      let activeProfile = account?.type;

      if (imageFile && imagePreview) {
        profileImageUrl = await uploadImageAndGetURL(activeProfileId, imagePreview, imageFile.name);
      }

      const profileData = {
        ...values,
        profileImageUrl,
        activeProfile
      };

      if (isEditMode && account) {
        const response = await updateProfile(activeProfileId, token, account.id, profileData);

        if (response.success) {
          toast({
            title: 'Success',
            description: 'Profile updated successfully.',
          });
          router.push('/dashboard/switch-profile');
        } else {
          toast({
            title: 'Error Updating Profile',
            description: response.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        }
      } else {
        const newProfile: NewProfile = {
          name: values.name,
          email: values.email,
          profileType: values.profileType,
          phone: values.phone,
          profileImageUrl,
        };

        const response = await createProfile(activeProfileId, token, newProfile);

        if (response.success) {
          toast({
            title: 'Success',
            description: 'Profile created successfully.',
          });
          router.push('/dashboard/switch-profile');
        } else {
          toast({
            title: 'Error Creating Profile',
            description: response.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {imagePreview && (
          <div className="flex justify-center">
            <img src={imagePreview} alt="Profile Preview" className="h-32 w-32 rounded-full object-cover" />
          </div>
        )}
        <FormField
          control={form.control}
          name="profileImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEditMode && account ? (
          <div className="space-y-2">
            <FormLabel>Profile Type</FormLabel>
            <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="profileType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Profile Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
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
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder="Enter phone number"
                  defaultCountry="US"
                  inputComponent={Input}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{isEditMode ? 'Update' : 'Submit'}</Button>
      </form>
    </Form>
  );
}
