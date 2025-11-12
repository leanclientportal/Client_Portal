'use client';

import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { Badge } from '@/components/ui/badge';

export default function SwitchProfilePage() {
  const role = useUserRole();

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">{role}</div>
          </div>
          <Badge>Active</Badge>
        </div>
    </div>
  );
}
