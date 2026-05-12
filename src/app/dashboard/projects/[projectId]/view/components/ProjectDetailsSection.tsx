'use client';

import { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter
import type { Project } from '@/lib/types';
import { capitalizeFirstLetter, formatDate } from '@/lib/utils'; // Import utility function
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { format } from 'date-fns';

interface ProjectDetailsSectionProps {
  project: Project | null;
  activeProfile: string | null;
  projectId: string;
}

const ProjectDetailsSection: FC<ProjectDetailsSectionProps> = ({ project, activeProfile, projectId }) => {
  const router = useRouter(); // Initialize useRouter here

  if (!project) {
    return null; // Or render a loading state/error message
  }

  return (
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Status</h3>
            <Badge
              variant={
                project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'
              }
            >
              {capitalizeFirstLetter(project.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Date Created</h3>
            <p className="text-muted-foreground">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Last Activity Date</h3>
            <p className="text-muted-foreground">{formatDate(project.lastActivityDate)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {activeProfile !== 'client' && (
              <Button onClick={() => router.push(`/dashboard/projects/${projectId}`)} className="bg-blue-500 text-white">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>
      </CardContent>
  );
};

export default ProjectDetailsSection;