'use client';

import { FC, useState, MouseEvent, useCallback, useMemo, useEffect } from 'react';
import { Project, SelectListItem, Task, ProjectFilterParams, CommonApiResponse, ApiAddResponseData, GetProjectsResponse, GetTasksResponse } from '@/lib/types';
import { deleteProject, getTasks, deleteTask, getClientsSelectList, getTenantsByClient, getProjects } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Edit, ListChecks, Loader2, Trash2, Eye, ArrowUp, ArrowDown, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import EditTaskForm from '../[projectId]/view/components/EditTaskForm';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute flex h-full w-full items-center justify-center opacity-100 transition-opacity duration-300 group-hover/action:opacity-0">
        {children}
      </div>
      <div className="absolute flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover/action:opacity-100">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
    </button>
  );
};

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
  activeProfile: string;
  initialClientId?: string; // Added initialClientId prop
}

type SortableColumn = 'name' | 'clientName' | 'status' | 'updatedAt';

const ProjectList: FC<ProjectListProps> = ({ projects, onProjectDeleted, activeProfile, initialClientId }) => {
  const { token, activeProfileId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [tasksToShow, setTasksToShow] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Temporary filter states
  const [searchTermInput, setSearchTermInput] = useState('');
  const [selectedClientInput, setSelectedClientInput] = useState(initialClientId || 'all'); // Set initialClientId here
  const [dateInput, setDateInput] = useState<DateRange | undefined>(undefined);
  const [displayProjects, setDisplayProjects] = useState<Project[]>(projects);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setDisplayProjects(projects);
  }, [projects]);

  useEffect(() => {
    // Set selectedClientInput when initialClientId changes (e.g., on direct navigation with clientId)
    if (initialClientId && selectedClientInput !== initialClientId) {
      setSelectedClientInput(initialClientId);
      handleFilter(); // Apply filter automatically if initialClientId is present
    }
  }, [initialClientId]);

  const [clients, setClients] = useState<SelectListItem[]>([]);
  const [tenants, setTenants] = useState<SelectListItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (token && activeProfileId) {
        try {
          if (activeProfile === 'client') {
            const response = await getTenantsByClient(activeProfileId, token);
            if (response.success && response.data) {
              setTenants(response?.data);
            }
          } else {
            const response = await getClientsSelectList(activeProfileId, token);
            if (response.success && response.data) {
              setClients(response?.data);
            }
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch clients or tenants.", variant: "destructive" });
        }
      }
    };
    fetchData();
  }, [token, activeProfile, activeProfileId, toast]);

  const handleFilter = async () => {
    if (!token || !activeProfileId || !activeProfile) {
      toast({ title: "Authentication Error", description: "Could not apply filters due to missing credentials.", variant: "destructive" });
      return;
    }

    setIsFiltering(true);
    try {
      const filters: ProjectFilterParams = {
        searchTerm: searchTermInput,
        selectedClient: selectedClientInput !== 'all' ? selectedClientInput : undefined,
        dateFrom: dateInput?.from ? dateInput.from.toISOString() : undefined,
        dateTo: dateInput?.to ? dateInput.to.toISOString() : undefined,
      };

      const response: CommonApiResponse<GetProjectsResponse> = await getProjects(activeProfile, token, activeProfileId, filters);
      if (response.success && response.data) {
        setDisplayProjects(response?.data?.projects);
        toast({ title: "Success", description: response.message || "Projects filtered successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to Projects filtered.", variant: "destructive" });
      }

    } catch (error: any) {
      toast({ title: "Filter Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsFiltering(false);
    }
  };

  const handleClear = async () => {
    setSearchTermInput('');
    setSelectedClientInput('all');
    setDateInput(undefined);
    setIsFiltering(true);
    try {
      const response: CommonApiResponse<GetProjectsResponse> = await getProjects(activeProfile, token!, activeProfileId!);
      if (response.success && response.data) {
        setDisplayProjects(response?.data?.projects);
        toast({ title: "Success", description: response.message || "Projects filtered successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to Projects filtered.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to clear filters and fetch all projects.", variant: "destructive" });
    } finally {
      setIsFiltering(false);
    }
  };

  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

  const getTenantName = useCallback((project: Project) => {
    if (typeof project.tenantId === 'object' && project.tenantId !== null) {
      return project.tenantId.companyName;
    }
    return 'N/A';
  }, []);

  const getClientName = useCallback((project: Project) => {
    if (typeof project.clientId === 'object' && project.clientId !== null) {
      return project.clientId.name;
    }
    return 'N/A';
  }, []);

  const filteredAndSortedProjects = useMemo(() => {
    if (displayProjects == undefined || displayProjects.length === 0) return [];

    // Create a copy of the displayProjects array to avoid modifying the)
    const sorted = [...displayProjects];

    sorted.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortColumn === 'clientName') {
        aValue = activeProfile === 'client' ? getTenantName(a) : getClientName(a);
        bValue = activeProfile === 'client' ? getTenantName(b) : getClientName(b);
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [displayProjects, sortColumn, sortDirection, activeProfile, getClientName, getTenantName]);

  const handleSort = (column: SortableColumn) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }

  const handleRowClick = (project: Project) => {
    router.push(`/dashboard/projects/${project._id}`);
  };

  const fetchTasksForProject = useCallback(async (project: Project) => {
    if (!activeProfileId || !token) {
      toast({ title: "Error", description: "Authentication details missing.", variant: "destructive" });
      setIsLoadingTasks(false);
      return;
    }
    try {
      const response: CommonApiResponse<GetTasksResponse> = await getTasks(token, project?._id, activeProfile);
      if (response.success && response.data) {
        setTasks(response?.data?.tasks);
        toast({ title: "Success", description: response.message || "tasks fetch successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch tasks.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch tasks.", variant: "destructive" });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [activeProfileId, token, toast]);

  const handleViewTasks = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setTasksToShow(project);
    setIsLoadingTasks(true);
    setTasks([]);
    fetchTasksForProject(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || !token) return;
    setIsDeleting(true);
    try {
      await deleteProject(token, projectToDelete._id);
      toast({ title: "Success", description: "Item deleted successfully." });
      onProjectDeleted(projectToDelete._id);
      setProjectToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete item.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleEditTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !tasksToShow || !token) return;
    setIsDeletingTask(true);
    try {
      await deleteTask(token, tasksToShow._id, taskToDelete._id);
      toast({ title: "Success", description: "Task deleted successfully." });
      fetchTasksForProject(tasksToShow);
      setTaskToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const getTaskStatusClasses = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo':
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeClasses = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'active': return 'bg-blue-500 hover:bg-blue-600';
      case 'on-hold': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500';
    }
  };

  interface SortableHeaderProps {
    column: SortableColumn;
    label: string;
  }

  const SortableHeader: FC<SortableHeaderProps> = ({ column, label }) => {
    const isCurrentSortColumn = sortColumn === column;
    const Icon = sortDirection === 'asc' ? ArrowUp : ArrowDown;
    return (
      <TableHead className="cursor-pointer" onClick={() => handleSort(column)}>
        <div className="flex items-center gap-2">{label}{isCurrentSortColumn && <Icon className="h-4 w-4" />}</div>
      </TableHead>
    );
  };

  return (
    <>
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search projects..."
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="w-full sm:w-72"
            />
            <Select onValueChange={setSelectedClientInput} value={selectedClientInput}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder={activeProfile === 'client' ? "Select Tenant" : "Select Client"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" key="all">All</SelectItem>

                {activeProfile === 'client'
                  ? <> {tenants.length > 0 && tenants.map((tenant, index) => (
                    <SelectItem
                      key={tenant?.value ?? `tenant-${index}`}
                      value={tenant?.value}
                    >
                      {tenant?.label}
                    </SelectItem>
                  ))
                  }
                  </>
                  : <>
                    {clients.length > 0 && clients.map((client, index) => (
                      <SelectItem
                        key={client?.value ?? `client-${index}`}
                        value={client?.value}
                      >
                        {client?.label}
                      </SelectItem>
                    ))
                    }
                  </>
                }
              </SelectContent>

            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button  size="default"
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal w-full sm:w-auto",
                    !dateInput && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateInput?.from ? (
                    dateInput.to ? (
                      <>{formatDate(dateInput.from)} - {formatDate(dateInput.to)}</>
                    ) : (
                      formatDate(dateInput.from)
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateInput?.from}
                  selected={dateInput}
                  onSelect={setDateInput}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button size="sm"  onClick={handleFilter} disabled={isFiltering} className="bg-blue-500 text-white">
              {isFiltering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
              Filter
            </Button>
            <Button size="sm"  onClick={handleClear} variant="outline"><X className="mr-2 h-4 w-4" />Clear</Button>
          </div>
          {/* Right side: Add Client */}
          <Link href="/dashboard/projects/add" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto" >
              Create Project
            </Button>
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="name" label="Project Title" />
                <SortableHeader column="clientName" label={activeProfile === 'client' ? 'Tenant Name' : 'Client Name'} />
                <SortableHeader column="status" label="Status" />
                <SortableHeader column="updatedAt" label="Last Activity Date" />
                <TableHead className="text-right w-[240px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects && filteredAndSortedProjects.length > 0 ? (filteredAndSortedProjects.map((project) => (
                <TableRow
                  key={project._id}
                  onClick={() => handleRowClick(project)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    {activeProfile === 'client' ? getTenantName(project) : getClientName(project)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-white text-xs font-medium px-2.5 py-0.5 rounded-full capitalize",
                        getStatusBadgeClasses(project.status)
                      )}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(project.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex justify-end items-center gap-1 rounded-full p-1" onClick={(e) => e.stopPropagation()}>
                      <ActionButton onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/projects/${project._id}/view`))} label="View" className="text-blue-500 hover:bg-blue-500"><Eye className="h-[22px] w-[22px]" /></ActionButton>
                      {activeProfile !== 'client' ?
                        <>
                          {/* <ActionButton onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/projects/${project._id}`))} label="Edit" className="text-yellow-500 hover:bg-yellow-500"><Edit className="h-[22px] w-[22px]" /></ActionButton> */}
                          {/* <ActionButton onClick={(e) => handleDeleteClick(e, project)} label="Delete" className="text-red-500 hover:bg-red-500"><Trash2 className="h-[22px] w-[22px]" /></ActionButton> */}


                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <span className="h-9 w-9 flex items-center justify-center rounded-full cursor-pointer hover:bg-lightprimary hover:text-primary">
                                <HiOutlineDotsVertical size={22} />
                              </span>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className="flex gap-3 cursor-pointer text-yellow-500"
                                onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                              >
                                <Icon icon="solar:pen-new-square-broken" height={18} />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="flex gap-3 cursor-pointer text-red-500"
                                onClick={(e) => {
                                  handleDeleteClick(e, project)
                                }}
                              >
                                <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                        : ""}
                    </div>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No projects found.</TableCell></TableRow>
              )
              }
            </TableBody>
          </Table>
        </div>
        <Dialog open={!!tasksToShow} onOpenChange={(isOpen) => !isOpen && setTasksToShow(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tasks for {tasksToShow?.name}</DialogTitle>
              <DialogDescription>Here are all the tasks associated with this item.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {isLoadingTasks ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="flex items-center space-x-4 pb-4">
                    {Object.entries(taskStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTaskStatusClasses(status as Task['status'])}`}>{status}: {count}</span>
                      </div>
                    ))}
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {tasks.length > 0 ? tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTaskStatusClasses(task.status)}`}>{task.status}</span></TableCell>
                          <TableCell>{formatDate(task.dueDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <ActionButton onClick={(e) => handleEditTaskClick(e, task)} label="Edit" className="text-yellow-500 hover:bg-yellow-500"><Edit className="h-[22px] w-[22px]" /></ActionButton>
                              <ActionButton onClick={(e) => handleDeleteTaskClick(e, task)} label="Delete" className="text-red-500 hover:bg-red-500"><Trash2 className="h-[22px] w-[22px]" /></ActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center">No tasks found for this item.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {taskToEdit && (
        <Dialog open={!!taskToEdit} onOpenChange={(isOpen) => !isOpen && setTaskToEdit(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
            <EditTaskForm projectId={tasksToShow!._id} task={taskToEdit} onTaskUpdated={() => { if (tasksToShow) { fetchTasksForProject(tasksToShow); } setTaskToEdit(null); }} setOpen={(isOpen) => !isOpen && setTaskToEdit(null)} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the item and all of its associated data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the task.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDeleteTask} disabled={isDeletingTask}>{isDeletingTask ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectList;
