'use client';

import { FC, useEffect, useState, useCallback, MouseEvent, useMemo, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks, deleteTask, getDocuments, deleteDocument, getInvoices, deleteInvoice, markInvoiceAsPaid } from '@/lib/api';
import type { Project, Task, Invoice, Documents } from '@/lib/types'; // Added Invoice type
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Loader2, Edit, Trash2, Paperclip, Download, Link as LinkIcon, Save, ArrowUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import AddFileDialog from './components/AddDocumentDialog';
import AddInvoiceDialog from './components/AddInvoiceDialog';
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
import { capitalizeFirstLetter, cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import EditInvoiceDialog from './components/EditInvoiceDialog';

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
  const { activeProfile, activeProfileId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<Invoice[]>([]); // Changed to Invoice[]
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
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
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  const [invoiceToPaid, setInvoiceToPaid] = useState<Invoice | null>(null);
  const [isPaidInvoice, setIsPaidInvoice] = useState(false);

  const [sortKey, setSortKey] = useState<keyof Task>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [invoiceSortKey, setInvoiceSortKey] = useState<keyof Invoice>('createdAt'); // New state for invoice sort key
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<'asc' | 'desc'>('asc'); // New state for invoice sort order
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fileSortKey, setFileSortKey] = useState<keyof Documents>('createdDate'); // New state for invoice sort key
  const [fileSortOrder, setFileSortOrder] = useState<'asc' | 'desc'>('asc'); // New state for invoice sort order


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
  }, [token, projectId, toast]);

  const fetchFiles = useCallback(async () => {
    if (!token || !projectId) {
      return;
    }
    setIsLoadingFiles(true);
    try {
      const filesData = await getDocuments(token, projectId);
      setProjectFiles(filesData);
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
      setProjectInvoices(invoicesData);
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
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'files') {
      fetchFiles();
    } else if (activeTab === 'invoices') {
      fetchInvoices();
    }
  }, [activeTab, fetchTasks, fetchFiles, fetchInvoices]);


  const handleDownload = (downloadUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [tasks, sortKey, sortOrder]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  const handleSort = (key: keyof Task) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedFiles = useMemo(() => {
    const sorted = [...projectFiles].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (fileSortKey === 'createdDate') {
        aValue = new Date(a[fileSortKey]).getTime();
        bValue = new Date(b[fileSortKey]).getTime();
      } else {
        aValue = (a[fileSortKey] || '').toString().toLowerCase();
        bValue = (b[fileSortKey] || '').toString().toLowerCase();
      }

      if (aValue < bValue) {
        return fileSortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return fileSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [projectFiles, fileSortKey, fileSortOrder]);

  // New function to handle invoice sorting
  const handleFileSort = (key: keyof Documents) => {
    if (fileSortKey === key) {
      setFileSortOrder(fileSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setFileSortKey(key);
      setFileSortOrder('asc');
    }
  };

  // New memoized function for sorted invoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...projectInvoices].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (invoiceSortKey === 'dueDate' || invoiceSortKey === 'createdAt') {
        aValue = new Date(a[invoiceSortKey]).getTime();
        bValue = new Date(b[invoiceSortKey]).getTime();
      } else if (invoiceSortKey === 'amount') {
        aValue = a[invoiceSortKey];
        bValue = b[invoiceSortKey];
      } else {
        aValue = (a[invoiceSortKey] || '').toString().toLowerCase();
        bValue = (b[invoiceSortKey] || '').toString().toLowerCase();
      }

      if (aValue < bValue) {
        return invoiceSortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return invoiceSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [projectInvoices, invoiceSortKey, invoiceSortOrder]);

  // New function to handle invoice sorting
  const handleInvoiceSort = (key: keyof Invoice) => {
    if (invoiceSortKey === key) {
      setInvoiceSortOrder(invoiceSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setInvoiceSortKey(key);
      setInvoiceSortOrder('asc');
    }
  };

  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

  const handleDeleteFileClick = (e: MouseEvent, file: any) => {
    e.stopPropagation();
    setFileToDelete(file);
  };

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    setIsDeletingFile(true);
    try {
      const response = await deleteDocument(token, projectId, fileToDelete._id);
      toast({ title: "Success", description: response.message || "Document deleted successfully" });
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

  const handleConfirmDeleteInvoice = async () => {
    if (!invoiceToDelete || !token) return;
    setIsDeletingInvoice(true);
    try {
      const response = await deleteInvoice(token, projectId, invoiceToDelete._id);
      toast({ title: "Success", description: response.message || "Invoice deleted successfully" });
      fetchInvoices();
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const handleDeleteTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !token) return;
    setIsDeletingTask(true);
    try {
      const response = await deleteTask(token, projectId, taskToDelete._id);
      toast({ title: "Success", description: response.message || "Task deleted successfully" });
      fetchTasks();
      setTaskToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleEditTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  const handleEditInvoiceClick = (e: MouseEvent, Invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToEdit(Invoice);
  };

  // invoice mark as paid

  const handlePaidInvoiceClick = (e: MouseEvent, Invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToPaid(Invoice);
  };

  const handleConfirmMarkPaidTask = async () => {
    if (!invoiceToPaid || !token) return;
    setIsPaidInvoice(true);
    try {
      const response = await markInvoiceAsPaid(token, projectId, invoiceToPaid._id);
      toast({ title: "Success", description: response.message || "Invoice paid successfully" });
      fetchInvoices();
      setInvoiceToPaid(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to paid invoice.", variant: "destructive" });
    } finally {
      setIsPaidInvoice(false);
    }
  };
  // end 

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
          <Card>
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
                  <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Last Activity Date</h3>
                  <p className="text-muted-foreground">{new Date(project.lastActivityDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  {activeProfile !== 'client' && (
                    <Button onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)} className="bg-blue-500 text-white">
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
                          {capitalizeFirstLetter(status)}: {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('title')}>
                            Title
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('status')}>
                            Status
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('dueDate')}>
                            Due Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusClasses(task.status)}`}>
                              {capitalizeFirstLetter(task.status)}
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
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => (prev * itemsPerPage < tasks.length ? prev + 1 : prev))}
                      disabled={currentPage * itemsPerPage >= tasks.length}
                    >
                      Next
                    </Button>
                  </div>
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
                      Add Documents
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
                    documents={projectFiles}
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
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleFileSort('title')}>
                          File Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleFileSort('updatedBy')}>
                          Uploaded By
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleFileSort('createdDate')}>
                          Uploaded Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFiles.length > 0 ? sortedFiles.map((file, index) => (
                      <TableRow key={index}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.uploadedBy}<br />{file.uploaderId.email}</TableCell>
                        <TableCell>{new Date(file.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">
                            <ActionButton
                              onClick={() => handleDownload(file.docUrl, file.name)}
                              label="Download"
                              className="text-blue-500 hover:bg-blue-500"
                            >
                              <Download className="h-5 w-5" />
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoices</CardTitle>
                <Dialog open={isAddInvoiceOpen} onOpenChange={setAddInvoiceOpen}>
                  <DialogTrigger asChild>
                    {activeProfile !== "client" && (<Button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Add Invoice
                    </Button>)}

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
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleInvoiceSort('title')}>
                          Title
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleInvoiceSort('amount')}>
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleInvoiceSort('status')}>
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleInvoiceSort('invoiceDate')}>
                          Invoice Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleInvoiceSort('dueDate')}>
                          Due Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInvoices.length > 0 ? sortedInvoices.map((invoice, index) => (
                      <TableRow key={index}>
                        <TableCell>{invoice.title}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>{capitalizeFirstLetter(invoice.status)}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1">

                            {invoice.invoiceUrl && (<ActionButton
                              onClick={() => handleDownload(invoice.invoiceUrl, invoice.title || `invoice-${invoice._id}`)}
                              label="Download"
                              className="text-blue-500 hover:bg-blue-500"
                            >
                              <Download className="h-5 w-5" />
                            </ActionButton>
                            )}
                            {activeProfile !== 'client' && (
                              <>
                                {invoice.status !== 'paid' && (
                                  <ActionButton
                                    onClick={(e) => handlePaidInvoiceClick(e, invoice)}
                                    label="Mark As Paid"
                                    className="text-green-500 hover:bg-green-500"
                                  >
                                    <Save className="h-5 w-5" />
                                  </ActionButton>
                                )}
                                <ActionButton
                                  onClick={(e) => handleEditInvoiceClick(e, invoice)}
                                  label="Edit"
                                  className="text-yellow-500 hover:bg-yellow-500"
                                >
                                  <Edit className="h-5 w-5" />
                                </ActionButton>
                                <ActionButton
                                  onClick={(e) => handleDeleteInvoiceClick(e, invoice)}
                                  label="Delete"
                                  className="text-red-500 hover:bg-red-500"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </ActionButton>
                              </>
                            )}

                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No invoices found for this project.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
     

      <AlertDialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteTask} disabled={isDeletingTask}>
              {isDeletingTask ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     

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

      {invoiceToEdit && (
        <Dialog open={!!invoiceToEdit} onOpenChange={(isOpen) => !isOpen && setInvoiceToEdit(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            <EditInvoiceDialog
              projectId={projectId}
              invoice={invoiceToEdit}
              onInvoiceUpdated={() => {
                fetchInvoices();
                setInvoiceToEdit(null);
              }}
              onClose={() => setInvoiceToEdit(null)}
              isOpen={!!invoiceToEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!invoiceToPaid} onOpenChange={(isOpen) => !isOpen && setInvoiceToPaid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to paid this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Once you confirm, the invoice status will be updated to “Paid”, This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMarkPaidTask} disabled={isPaidInvoice}>
              {isPaidInvoice ? 'Mark as paid...' : 'Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(isOpen) => !isOpen && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteInvoice} disabled={isDeletingInvoice}>
              {isDeletingInvoice ? 'Deleting...' : 'Delete'}
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
