'use client';

import { FC, useEffect, useState, useCallback, use } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks, getDocuments, getInvoices } from '@/lib/api';
import type { Project, Task, Invoice, Documents } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react'; // Only keeping ArrowLeft for general navigation
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the new section components
import ProjectDetailsSection from './components/ProjectDetailsSection';
import TaskSection from './components/TaskSection';
import DocumentSection from './components/DocumentSection';
import InvoiceSection from './components/InvoiceSection';

interface ViewProjectDetailsProps {
  params: Promise<{
    clientId: string;
    projectId: string;
  }>
}

// ActionButton is assumed to be extracted into its own file or not needed directly in page.tsx
// If it's still needed globally, ensure it's imported or defined elsewhere.

function ViewProjectDetailsContent({ clientId, projectId }: { clientId: string, projectId: string }) {
  const { toast } = useToast();
  const { activeProfile, activeProfileId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFiles, setProjectFiles] = useState<Documents[]>([]); // Changed to Documents[]
  const [projectInvoices, setProjectInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const fetchProject = useCallback(async () => {
    if (!activeProfileId || !token || !projectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const projectData = await getProject(token, projectId);
      setProject(projectData);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch project details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId, token, projectId, toast]);

  const fetchTasks = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }
    setIsLoadingTasks(true);
    try {
      const tasksData = await getTasks(token, projectId, activeProfile);
      setTasks(tasksData.tasks);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch tasks.", variant: "destructive" });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token, projectId, activeProfile, toast]); // Added activeProfile to dependencies

  const fetchFiles = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }
    setIsLoadingFiles(true);
    try {
      const filesData = await getDocuments(token, projectId);
      setProjectFiles(filesData.documents); // Corrected: access the 'documents' property
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch files.", variant: "destructive" });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [token, projectId, toast]);

  const fetchInvoices = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }
    setIsLoadingInvoices(true);
    try {
      const invoicesData = await getInvoices(token, projectId);
      setProjectInvoices(invoicesData.invoice); // Corrected: access the 'invoice' property
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [token, projectId, toast]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    // Only fetch data for the active tab to avoid unnecessary API calls
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'files') {
      fetchFiles();
    } else if (activeTab === 'invoices') {
      fetchInvoices();
    }
    // No need to fetch for 'details' as project data is always fetched
  }, [activeTab, fetchTasks, fetchFiles, fetchInvoices]);


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
          <CardDescription>The project you are looking for could not be found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </div>

      <Tabs defaultValue="details" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Documents</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ProjectDetailsSection
            project={project}
            activeProfile={activeProfile}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskSection
            projectId={projectId}
            tasks={tasks}
            isLoadingTasks={isLoadingTasks}
            fetchTasks={fetchTasks}
            activeProfile={activeProfile}
          />
        </TabsContent>

        <TabsContent value="files">
          <DocumentSection
            projectId={projectId}
            projectFiles={projectFiles}
            isLoadingFiles={isLoadingFiles}
            fetchFiles={fetchFiles}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceSection
            projectId={projectId}
            projectInvoices={projectInvoices}
            isLoadingInvoices={isLoadingInvoices}
            fetchInvoices={fetchInvoices}
            activeProfile={activeProfile}
          />
        </TabsContent>

        <TabsContent value="updates">
          {/* <UpdatesTimeline projectId={projectId} /> */}
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function ViewProjectDetailsPage({ params }: ViewProjectDetailsProps) {
  const resolvedParams = use(params);
  return <ViewProjectDetailsContent {...resolvedParams} />;
}
