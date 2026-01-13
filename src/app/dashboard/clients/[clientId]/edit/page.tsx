'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getClient } from '@/lib/api';
import type { Client, CommonApiResponse } from '@/lib/types';
import EditClientForm from "./components/EditClientForm";
import BreadcrumbComp from '@/app/dashboard/layout/shared/breadcrumb/BreadcrumbComp';

// This component now receives the resolved clientId directly
function EditClientPageContent({ clientId }: { clientId: string }) {
  const { activeProfileId: tenantId, token } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !tenantId || !clientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getClient(token, tenantId, clientId)
      .then((response: CommonApiResponse<Client>) => {
        if (response.success && response.data) {
          setClient(response.data); // Directly assign response.data
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch client data.');
          setClient(null);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to fetch client data.');
        setClient(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, tenantId, clientId]); // clientId is now a direct dependency

  if (loading) {
    return <div>Loading client details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  if (!client) {
    return <div className="text-center text-muted-foreground">Client not found.</div>;
  }
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Edit Client" },
  ];

  return (
    <>
      <BreadcrumbComp title="Edit Client" items={BCrumb} />
      <EditClientForm client={client} />
    </>
  );

}

// The top-level page component resolves the promise and passes the string clientId
export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const resolvedParams = use(params); // Resolve the promise here
  return <EditClientPageContent clientId={resolvedParams.clientId} />; // Pass the resolved clientId
}
