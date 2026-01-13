'use client';

import { FC, useEffect, useState, useCallback, use } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks, getDocuments, getInvoices } from '@/lib/api';
import type { Project, Task, Invoice, Documents, CommonApiResponse, GetTasksResponse, GetDocumentsResponse, GetInvoicesResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Paperclip, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import ProjectDetailsSection from './components/ProjectDetailsSection';
import TaskSection from './components/TaskSection';
import DocumentSection from './components/DocumentSection';
import InvoiceSection from './components/InvoiceSection';
import AddDocumentDialog from './components/AddDocumentDialog';
import AddInvoiceDialog from './components/AddInvoiceDialog';
import AddTaskForm from './components/AddTaskForm';
import BreadcrumbComp from '@/app/dashboard/layout/shared/breadcrumb/BreadcrumbComp';

interface ViewProjectDetailsProps {
  params: Promise<{
    clientId: string;
    projectId: string;
  }>
}

function ViewProjectDetailsContent({ clientId, projectId }: { clientId: string, projectId: string }) {
  const { toast } = useToast();
  const { activeProfile, activeProfileId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFiles, setProjectFiles] = useState<Documents[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isAddFileOpen, setAddFileOpen] = useState(false);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isAddInvoiceOpen, setAddInvoiceOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!activeProfileId || !token || !projectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response: CommonApiResponse<Project> = await getProject(token, projectId);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch project details.", variant: "destructive" });
        setProject(null);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch project details.", variant: "destructive" });
      setProject(null);
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
      const response: CommonApiResponse<GetTasksResponse> = await getTasks(token, projectId, activeProfile);
      if (response.success && response.data) {
        setTasks(response.data.tasks);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch tasks.", variant: "destructive" });
        setTasks([]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch tasks.", variant: "destructive" });
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token, projectId, activeProfile, toast]);

  const fetchFiles = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }
    setIsLoadingFiles(true);
    try {
      const response: CommonApiResponse<GetDocumentsResponse> = await getDocuments(token, projectId);
      if (response.success && response.data) {
        setProjectFiles(response.data.documents);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch files.", variant: "destructive" });
        setProjectFiles([]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch files.", variant: "destructive" });
      setProjectFiles([]);
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
      const response: CommonApiResponse<GetInvoicesResponse> = await getInvoices(token, projectId);
      if (response.success && response.data) {
        setProjectInvoices(response.data.invoices);
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch invoices.", variant: "destructive" });
        setProjectInvoices([]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch invoices.", variant: "destructive" });
      setProjectInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [token, projectId, toast]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'files') {
      fetchFiles();
    } else if (activeTab === 'invoices') {
      fetchInvoices();
    }
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
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: project.name },
  ];

  return (
    <>
      <BreadcrumbComp title={project.name} items={BCrumb} />
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">

        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList className='w-1/2 flex justify-between items-center gap-2 bg-lightprimary'>
              <TabsTrigger value="details" className='data-[state=active]:bg-primary data-[state=active]:text-white'>Details</TabsTrigger>
              <TabsTrigger value="tasks" className=' data-[state=active]:bg-primary data-[state=active]:text-white'>Tasks</TabsTrigger>
              <TabsTrigger value="files" className='   data-[state=active]:bg-primary data-[state=active]:text-white'>Documents</TabsTrigger>
              <TabsTrigger value="invoices" className='  data-[state=active]:bg-primary data-[state=active]:text-white'>Invoices</TabsTrigger>

            </TabsList>

            {activeTab === 'tasks' && (
              <Dialog open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <AddTaskForm
                    projectId={projectId}
                    onTaskAdded={() => {
                      fetchTasks();
                      setAddTaskOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'files' && (
              <Dialog open={isAddFileOpen} onOpenChange={setAddFileOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <AddDocumentDialog
                  isOpen={isAddFileOpen}
                  onClose={() => setAddFileOpen(false)}
                  onFileUploaded={() => {
                    fetchFiles();
                    setAddFileOpen(false);
                  }}
                  projectId={projectId}
                  documents={projectFiles}
                />
              </Dialog>
            )}

            {activeTab === 'invoices' && (
              <Dialog open={isAddInvoiceOpen} onOpenChange={setAddInvoiceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Invoice
                  </Button>
                </DialogTrigger>
                <AddInvoiceDialog
                  isOpen={isAddInvoiceOpen}
                  onClose={() => setAddInvoiceOpen(false)}
                  onInvoiceAdded={() => {
                    fetchInvoices();
                    setAddInvoiceOpen(false);
                  }}
                  projectId={projectId}
                />
              </Dialog>
            )}
          </div>

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
        </Tabs>
      </div>
    </>
  );
}

export default function ViewProjectDetailsPage({ params }: ViewProjectDetailsProps) {
  const resolvedParams = use(params);
  return <ViewProjectDetailsContent {...resolvedParams} />;
}
