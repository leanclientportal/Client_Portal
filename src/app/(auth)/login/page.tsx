'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLogin } from '@/queries/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const { push } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginMutation, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    const [tenantId] = data.email.split('@');
    loginMutation({ ...data, tenantId }, {
      onSuccess: (response) => {
        login(response.jwt, tenantId);
        toast({ title: 'Login Successful', description: 'You have been successfully logged in.' });
        push('/');
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
        <form className="w-full max-w-sm" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
          <div className="mb-4">
            <Input {...register('email')} placeholder="Email" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6 relative">
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
        </form>
      </div>
    </main>
  );
}
