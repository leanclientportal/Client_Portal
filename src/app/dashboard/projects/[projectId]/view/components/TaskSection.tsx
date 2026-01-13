'use client';

import { FC, useState, useMemo, MouseEvent, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, PlusCircle, Loader2, Edit, Trash2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import AddTaskForm from './AddTaskForm';
import EditTaskForm from './EditTaskForm';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { deleteTask } from '@/lib/api';
import type { Task, CommonApiResponse, ApiAddResponseData } from '@/lib/types'; // Added CommonApiResponse, ApiAddResponseData
import { capitalizeFirstLetter, cn, formatDate } from '@/lib/utils';
import { ActionButton } from './ActionButton'; // Assuming ActionButton is also extracted

interface TaskSectionProps {
  projectId: string;
  tasks: Task[];
  isLoadingTasks: boolean;
  fetchTasks: () => Promise<void>;
  activeProfile: string | null;
}

const TaskSection: FC<TaskSectionProps> = ({ projectId, tasks, isLoadingTasks, fetchTasks, activeProfile }) => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [sortKey, setSortKey] = useState<keyof Task>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Assuming a fixed number of items per page

  const handleSort = (key: keyof Task) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
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

  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

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

  const handleDeleteTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !token) return;
    setIsDeletingTask(true);
    try {
      const response: CommonApiResponse<ApiAddResponseData> = await deleteTask(token, projectId, taskToDelete._id);
      if (response.success) {
        toast({ title: "Success", description: response.message || "Task deleted successfully" });
        fetchTasks();
        setTaskToDelete(null);
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete task.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleEditTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  return (
    <Card>
      <CardContent className='p-0'>
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
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
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
    </Card>
  );
};

export default TaskSection;