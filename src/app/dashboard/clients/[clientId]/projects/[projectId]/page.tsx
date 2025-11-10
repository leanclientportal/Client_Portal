'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import ViewProjectDetails from "./components/ViewProjectDetails";

function ViewProjectPageContent({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <ViewProjectDetails clientId={resolvedParams.clientId} projectId={resolvedParams.projectId} />
    </div>
  );
}


export default function ViewProjectPage({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
  return <ViewProjectPageContent params={params} />;
}
