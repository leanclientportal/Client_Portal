'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getProjects } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Project } from '@/lib/types';
import ProjectList from '../clients/[clientId]/projects/components/ProjectList';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeProfileId, activeProfile, token } = useAuth();

  useEffect(() => {
    if (!activeProfileId || !token) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { projects: fetchedProjects } = await getProjects(activeProfile as string, token, activeProfileId);
        setProjects(fetchedProjects);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeProfileId, token, activeProfile]);

  const handleProjectDeleted = (projectId: string) => {
    setProjects(currentProjects => currentProjects.filter(p => p._id !== projectId));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/dashboard/projects/add">
          <Button>Create Project</Button>
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : (
        <ProjectList projects={projects} onProjectDeleted={handleProjectDeleted} />
      )}
    </div>
  );
}
