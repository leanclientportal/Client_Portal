'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSendOtp, useVerifyOtp } from '@/queries/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { PhoneNumberInput } from '@/components/ui/phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().refine(val => !val || isValidPhoneNumber(val), {
    message: "Invalid phone number."
  }).optional(),
  otp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const { push } = useRouter();
  const [step, setStep] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [profileType, setProfileType] = useState('client');

  const { mutate: sendOtpMutation, isPending: isSendingOtp } = useSendOtp();
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useVerifyOtp();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleSendOtp = async () => {
    const emailValue = form.getValues('email');
    const nameValue = form.getValues('name');
    const phoneValue = form.getValues('phone');
    const isValid = await form.trigger(['email', 'name', 'phone']);
    if (!isValid) return;

    setName(nameValue);
    setEmail(emailValue);
    setPhone(phoneValue);
    sendOtpMutation({ email: emailValue, type: 'registration' }, {
      onSuccess: (response) => {
        if (response.status === 200) {
          setStep('otp');
          toast({ title: 'OTP Sent', description: response.message });
        } else {
          toast({ title: 'Error', description: response.message || 'Failed to send OTP. Please try again.', variant: 'destructive' });
        }
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
      },
    });
  };

  const onOtpSubmit = (data: FormValues) => {
    if (!data.otp) return;

    verifyOtpMutation({ email, otp: data.otp, type: 'registration', name, phone, profileType }, {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast({ title: 'OTP Verified', description: 'Your account has been successfully created.' });
          push('/login');
        } else {
          toast({ title: 'Error', description: response.message || 'Invalid OTP. Please try again.', variant: 'destructive' });
        }
      },
      onError: () => {
        toast({ title: 'Error', description: 'Invalid OTP. Please try again.', variant: 'destructive' });
      },
    });
  };

  const handleEditEmail = () => {
    setStep('email');
  };

  return (
    <main className="h-screen w-screen grid grid-cols-2">
      <div className="bg-primary flex flex-col items-start justify-center p-20 text-white">
        <h1 className="text-5xl font-bold">ClientVerse</h1>
        <p className="text-xl mt-4">A modern portal for client management.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onOtpSubmit)}>
              <h2 className="text-3xl font-bold mb-8 text-center">Register</h2>

              <div className="mb-4">
                <Input {...form.register('name')} placeholder="Name" disabled={step === 'otp'} />
                {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div className="mb-4">
                <Input {...form.register('email')} placeholder="Email" disabled={step === 'otp'} />
                {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>}
              </div>

              <div className="mb-4">
                <PhoneNumberInput name="phone" disabled={step === 'otp'} />
                {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
              </div>

              {step === 'email' && (
                <RadioGroup defaultValue="User" onValueChange={setProfileType} className="flex gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client">User</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="tenant" />
                    <Label htmlFor="tenant">Tenant</Label>
                  </div>
                </RadioGroup>
              )}

              {step === 'otp' && (
                <div className="mb-4">
                  <Input {...form.register('otp')} placeholder="Enter OTP" />
                  {form.formState.errors.otp && <p className="text-red-500 text-sm mt-1">{form.formState.errors.otp.message}</p>}
                  <div className="flex justify-between items-center mt-2">
                    <Button variant="link" size="sm" onClick={handleSendOtp} disabled={isSendingOtp}>
                      {isSendingOtp ? 'Resending...' : 'Resend OTP'}
                    </Button>
                    <Button variant="link" size="sm" onClick={handleEditEmail}>Edit Details</Button>
                  </div>
                </div>
              )}

              {step === 'email' ? (
                <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isSendingOtp}>
                  {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={isVerifyingOtp}>
                  {isVerifyingOtp ? 'Verifying...' : 'Verify & Register'}
                </Button>
              )}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </FormProvider>
        </div>
      </div>
    </main>
  );
}
