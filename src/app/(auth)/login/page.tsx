'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSendOtp, useVerifyOtp } from '@/queries/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  emailOrPhone: z.string().min(1, { message: 'Please enter a valid email address or phone number' }),
  otp: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const { mutate: sendOtpMutation, isPending: isSendingOtp } = useSendOtp();
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useVerifyOtp();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleSendOtp = async () => {
    const emailOrPhoneValue = form.getValues('emailOrPhone');
    const isValid = await form.trigger('emailOrPhone');
    if (!isValid) return;

    setEmailOrPhone(emailOrPhoneValue);
    sendOtpMutation({ email: emailOrPhoneValue, type: 'login' }, {
      onSuccess: (response) => {
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: response.message,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send OTP',
          variant: 'destructive',
        });
      },
    });
  };

  const onOtpSubmit = (data: FormValues) => {
    if (!data.otp) return;

    verifyOtpMutation({ email: emailOrPhone, otp: data.otp, type: 'login' }, {
      onSuccess: (response) => {
        if (response.code === 200 && response.data) {
          login(response.data.token, response.data.userId, response.data.activeProfile, response.data.activeProfileId, response.data.activeProfileImage, response.data.profileName);
          toast({ title: 'Login Successful', description: response.message });
          // router.push('/dashboard');
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
    form.reset();
  };

  return (
    <main className="h-screen w-screen grid grid-cols-2">
      <div className="bg-primary flex flex-col items-start justify-center p-20 text-white">
        <h1 className="text-5xl font-bold">ClientVerse</h1>
        <p className="text-xl mt-4">A modern portal for client management.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <form onSubmit={form.handleSubmit(onOtpSubmit)}>
            <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
            <div className="mb-4 space-y-2">
              <Input {...form.register('emailOrPhone')} placeholder="Email or Phone" disabled={step === 'otp'} />
              {form.formState.errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{form.formState.errors.emailOrPhone.message}</p>}
            </div>

            {step === 'otp' && (
              <div className="mb-4">
                <Input {...form.register('otp')} placeholder="Enter OTP" />
                {form.formState.errors.otp && <p className="text-red-500 text-sm mt-1">{form.formState.errors.otp.message}</p>}
                <div className="flex justify-between items-center mt-2">
                  <Button variant="link" size="sm" onClick={handleSendOtp} disabled={isSendingOtp}>
                    {isSendingOtp ? 'Resending...' : 'Resend OTP'}
                  </Button>
                  <Button variant="link" size="sm" onClick={handleEditEmail}>Edit Email</Button>
                </div>
              </div>
            )}

            {step === 'email' ? (
              <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            ) : (
              <Button type="submit" className="w-full" disabled={isVerifyingOtp}>
                {isVerifyingOtp ? 'Verifying...' : 'Login'}
              </Button>
            )}
            {/* <p className="text-center text-sm mt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p> */}
          </form>
        </div>
      </div>
    </main>
  );
}
