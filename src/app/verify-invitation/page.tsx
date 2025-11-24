'use client';

import { Suspense } from 'react';
import VerifyInvitation from './VerifyInvitation';

export default function VerifyInvitationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyInvitation />
    </Suspense>
  );
}
