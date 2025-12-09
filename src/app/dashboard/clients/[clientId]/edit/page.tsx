'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getClient } from '@/lib/api';
import type { Client } from '@/lib/types';
import EditClientForm from "./components/EditClientForm";

function EditClientPageContent({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const { activeProfileId: tenantId, token } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && tenantId) {
      getClient(token, tenantId, clientId)
        .then(data => {
          setClient(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to fetch client data.');
          setLoading(false);
        });
    }
  }, [token, tenantId, clientId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Client</h1>
      </div>
      {client && <EditClientForm client={client} />}
    </div>
  );
}

export default function EditClientPage({ params }: { params: { clientId: string } }) {
  return <EditClientPageContent params={Promise.resolve(params)} />;
}
