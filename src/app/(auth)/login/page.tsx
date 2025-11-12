'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLogin } from '@/queries/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  emailOrPhone: z.string().min(1, { message: 'Please enter a valid email address or phone number' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const { push } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginMutation, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    loginMutation(data, {
      onSuccess: (response) => {
        if (response.status === 200) {
          login(response.token, response.userId);
          toast({ title: 'Login Successful', description: response.message });
          push('/dashboard');
        } else {
          toast({ title: 'Login Failed', description: response.message, variant: 'destructive' });
        }
      },
      onError: () => {
        toast({ title: 'Login Failed', description: 'Please check your credentials and try again.', variant: 'destructive' });
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
            <div className="mb-4 space-y-2">
              <Input {...register('emailOrPhone')} placeholder="Email or Phone" />
              {errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone.message}</p>}
            </div>
            <div className="mb-4 space-y-2 relative">
              <Input
                {...register('password')}
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
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm mt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
