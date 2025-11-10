'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRegister, useSendOtp, useVerifyOtp } from '@/queries/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthResponse } from '@/lib/types';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters' }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: sendOtpMutation, isPending: isSendingOtp } = useSendOtp();
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useVerifyOtp();
  const { mutate: registerMutation, isPending: isRegistering } = useRegister();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onEmailSubmit = (data: EmailFormValues) => {
    setEmail(data.email);
    sendOtpMutation(data.email, {
      onSuccess: (response) => {
        setStep('otp');
        toast({ title: 'OTP Sent', description: response.message });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
      },
    });
  };

  const onOtpSubmit = (data: OtpFormValues) => {
    verifyOtpMutation({ email, otp: data.otp }, {
      onSuccess: () => {
        setStep('password');
        toast({ title: 'OTP Verified', description: 'Your email has been successfully verified.' });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Invalid OTP. Please try again.', variant: 'destructive' });
      },
    });
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    const [tenantId] = email.split('@');
    registerMutation({ email, password: data.password }, {
      onSuccess: (response: AuthResponse) => {
        if (response.success) {
          login(response.data.token, response.data.tenant.id);
          toast({ title: 'Registration Successful', description: response.message });
        } else {
          toast({ title: 'Registration Failed', description: response.message, variant: 'destructive' });
        }
      },
      onError: () => {
        toast({ title: 'Registration Failed', description: 'Please try again.', variant: 'destructive' });
      },
    });
  };

  return (
    <main className="h-screen w-screen grid grid-cols-2">
      <div className="bg-primary flex flex-col items-start justify-center p-20 text-white">
        <h1 className="text-5xl font-bold">ClientVerse</h1>
        <p className="text-xl mt-4">A modern portal for client management.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <h2 className="text-3xl font-bold mb-8 text-center">Register</h2>
              <div className="mb-4">
                <Input {...emailForm.register('email')} placeholder="Email" />
                {emailForm.formState.errors.email && <p className="text-red-500 text-sm mt-1">{emailForm.formState.errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}
          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
              <h2 className="text-3xl font-bold mb-8 text-center">Verify OTP</h2>
              <div className="mb-4">
                <Input {...otpForm.register('otp')} placeholder="Enter OTP" />
                {otpForm.formState.errors.otp && <p className="text-red-500 text-sm mt-1">{otpForm.formState.errors.otp.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isVerifyingOtp}>
                {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </form>
          )}
          {step === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <h2 className="text-3xl font-bold mb-8 text-center">Set Password</h2>
              <div className="mb-4 relative">
                <Input
                  {...passwordForm.register('password')}
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordForm.formState.errors.password && <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.password.message}</p>}
              </div>
              <div className="mb-6 relative">
                <Input
                  {...passwordForm.register('confirmPassword')}
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
