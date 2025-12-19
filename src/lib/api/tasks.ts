// src/lib/api/tasks.ts

import { httpClient } from './http-client';
import type {
  Task,
  GetTasksResponse,
  NewTask,
  ApiAddResponseData,
  CommonApiResponse,
} from '../types';

export async function getTasks(token: string, projectId: string, activeProfile: any): Promise<CommonApiResponse<GetTasksResponse>> {
  return httpClient<GetTasksResponse>(`/tasks/${projectId}/${activeProfile}`, { token });
}

export async function getTask(token: string, taskId: string): Promise<CommonApiResponse<Task>> {
  return httpClient<Task>(`/tasks/single/${taskId}`, { token });
}

export async function addTask(token: string, projectId: string, newTask: NewTask): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/tasks/${projectId}`, {
    method: 'POST',
    token,
    data: newTask,
  });
}

export async function updateTask(token: string, projectId: string, taskId: string, updatedTask: Partial<NewTask>): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/tasks/${projectId}/${taskId}`, {
    method: 'PUT',
    token,
    data: updatedTask,
  });
}

export async function deleteTask(token: string, projectId: string, taskId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/tasks/${projectId}/${taskId}`, {
    method: 'DELETE',
    token,
  });
}
