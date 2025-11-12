'use client';

import { FC, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClient, getProjects } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Client, Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectList from './components/ProjectList';

const ClientProjectsPage: FC = () => {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeProfile, token, activeProfileId } = useAuth();

  useEffect(() => {
    if (!token || !clientId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, projectsData] = await Promise.all([
          getClient(token, clientId),
          getProjects(activeProfile, token, activeProfileId)
        ]);
        setClient(clientData);
        setProjects(projectsData.projects);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeProfile, token, activeProfileId, clientId]);

  const handleProjectDeleted = (projectId: string) => {
    setProjects(currentProjects => currentProjects.filter(p => p._id !== projectId));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{client?.name}</h1>
      <ProjectList projects={projects} onProjectDeleted={handleProjectDeleted} />
    </div>
  );
};

export default ClientProjectsPage;
