'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { verifyInvitation } from '@/lib/api';

export default function VerifyInvitation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your invitation...');

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invitation token is missing.');
      return;
    }

    const verifyToken = async () => {
      try {
        const data = await verifyInvitation(token);
        if (data.success) {
          setVerificationStatus('success');
          setMessage(data.message || 'Invitation verified successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Failed to verify invitation.');
        }
      } catch (error: any) {
        setVerificationStatus('error');
        setMessage(error.message || 'An error occurred during verification.');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Invitation Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>{message}</p>
          {verificationStatus === 'error' && (
            <Button asChild className="mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
