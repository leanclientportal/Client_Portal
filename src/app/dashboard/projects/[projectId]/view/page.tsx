
'use client';

import { FC, useEffect, useState, useCallback, MouseEvent, useMemo, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks, deleteTask, deleteProjectFile, getDocuments } from '@/lib/api';
import type { Project, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Loader2, Edit, Trash2, Paperclip, Download, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import AddFileDialog from './components/AddFileDialog';
// import AddInvoiceDialog from '../components/AddInvoiceDialog';
// import EditInvoiceDialog from '../components/EditInvoiceDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import UpdatesTimeline from '../components/UpdatesTimeline';

interface ViewProjectDetailsProps {
  params: Promise<{
    clientId: string;
    projectId: string;
  }>
}

const ActionButton: FC<{ onClick: (e: MouseEvent) => void; children: React.ReactNode; label: string; className?: string; }> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute opacity-0 group-hover/action:opacity-100 transition-opacity duration-300">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
      <div className="absolute opacity-100 group-hover/action:opacity-0 transition-opacity duration-300">
        {children}
      </div>
    </button>
  );
};

function ViewProjectDetailsContent({ clientId, projectId }: { clientId: string, projectId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeProfileId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isAddFileOpen, setAddFileOpen] = useState(false);
  const [isAddInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<any | null>(null);
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
      setIsLoadingTasks(false);
      return;
    }
    setIsLoadingTasks(true);
    try {
      const tasksData = await getTasks(token, projectId);
      setTasks(tasksData.tasks);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch tasks.", variant: "destructive" });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token, projectId, toast]);

  const fetchFiles = useCallback(async () => {
    if (!token || !projectId) {
      setIsLoadingFiles(false);
      return;
    }
    setIsLoadingFiles(true);
    try {
      const filesData = await getDocuments(token, projectId);
      setProjectFiles(filesData.documents);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch files.", variant: "destructive" });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [token, projectId, toast]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchFiles();
  }, [fetchProject, fetchTasks, fetchFiles]);

  const handleDownload = (downloadUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

  const invoiceStatusCounts = useMemo(() => {
    return projectInvoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projectInvoices]);

  const handleDeleteFileClick = (e: MouseEvent, file: any) => {
    e.stopPropagation();
    setFileToDelete(file);
  };
  
  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    setIsDeletingFile(true);
    try {
      // await deleteProjectFile(token, projectId, fileToDelete._id);
      toast({ title: "Success", description: "File deleted successfully." });
      fetchFiles();
      setFileToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete file.", variant: "destructive" });
    } finally {
      setIsDeletingFile(false);
    }
  };

  const handleDeleteInvoiceClick = (e: MouseEvent, invoice: any) => {
    e.stopPropagation();
    setInvoiceToDelete(invoice);
  };

  const handleEditInvoiceClick = (e: MouseEvent, invoice: any) => {
    e.stopPropagation();
    setInvoiceToEdit(invoice);
  };

  const handleDeleteTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleEditTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  const getTaskStatusClasses = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getInvoiceStatusClasses = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'due':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </div>

      <Tabs defaultValue="details" className="mt-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Status</h3>
                  <Badge
                    variant={
                      project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Active</h3>
                  <p className="text-muted-foreground">{project.isActive ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Date Created</h3>
                  <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Last Updated</h3>
                  <p className="text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push(`/dashboard/projects/${projectId}`)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tasks</CardTitle>
                <Dialog open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <AddTaskForm
                      projectId={projectId}
                      onTaskAdded={() => {
                        fetchTasks();
                        setAddTaskOpen(false);
                      }}
                      setOpen={setAddTaskOpen}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4 pb-4">
                    {Object.entries(taskStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusClasses(status as Task['status'])}`}>
                          {status}: {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.length > 0 ? tasks.map(task => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusClasses(task.status)}`}>
                              {task.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">
                              <ActionButton
                                onClick={(e) => handleEditTaskClick(e, task)}
                                label="Edit"
                                className="text-yellow-500 hover:bg-yellow-500"
                              >
                                <Edit className="h-5 w-5" />
                              </ActionButton>
                              <ActionButton
                                onClick={(e) => handleDeleteTaskClick(e, task)}
                                label="Delete"
                                className="text-red-500 hover:bg-red-500"
                              >
                                <Trash2 className="h-5 w-5" />
                              </ActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No tasks found for this project.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Files</CardTitle>
                <Dialog open={isAddFileOpen} onOpenChange={setAddFileOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Add File
                    </Button>
                  </DialogTrigger>
                  <AddFileDialog
                    isOpen={isAddFileOpen}
                    onClose={() => setAddFileOpen(false)}
                    onFileUploaded={() => {
                      fetchFiles();
                      setAddFileOpen(false);
                    }}
                    projectId={projectId}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Date Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectFiles.length > 0 ? projectFiles.map((file, index) => (
                      <TableRow key={index}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">
                            <ActionButton
                              onClick={() => handleDownload(file.downloadURL, file.name)}
                              label="Download"
                              className="text-blue-500 hover:bg-blue-500"
                            >
                              <Download className="h-5 w-5" />
                            </ActionButton>
                            <ActionButton
                              onClick={(e) => handleDeleteFileClick(e, file)}
                              label="Delete"
                              className="text-red-500 hover:bg-red-500"
                            >
                              <Trash2 className="h-5 w-5" />
                            </ActionButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No files found for this project.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices">
          {/* Invoice content here */}
        </TabsContent>
        <TabsContent value="updates">
          {/* <UpdatesTimeline projectId={projectId} /> */}
        </TabsContent>
      </Tabs>

      {taskToEdit && (
        <Dialog open={!!taskToEdit} onOpenChange={(isOpen) => !isOpen && setTaskToEdit(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <EditTaskForm
              projectId={projectId}
              task={taskToEdit}
              onTaskUpdated={() => {
                fetchTasks();
                setTaskToEdit(null);
              }}
              setOpen={(isOpen) => !isOpen && setTaskToEdit(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteFile} disabled={isDeletingFile}>
              {isDeletingFile ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ViewProjectDetailsPage({ params }: ViewProjectDetailsProps) {
    const resolvedParams = use(params);
    return <ViewProjectDetailsContent {...resolvedParams} />;
}
