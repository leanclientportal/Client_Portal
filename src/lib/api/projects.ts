// src/lib/api/projects.ts

import { httpClient } from './http-client';
import type {
  Project,
  GetProjectsResponse,
  NewProject,
  ApiAddResponseData,
  ProjectFilterParams,
  CommonApiResponse,
} from '../types';

export async function getProjects(
  activeProfile: string,
  token: string,
  activeProfileId: string,
  filters: ProjectFilterParams = {}
): Promise<CommonApiResponse<GetProjectsResponse>> {
  return httpClient<GetProjectsResponse>(`/projects/${activeProfile}/${activeProfileId}`, {
    method: 'POST',
    token,
    data: filters,
  });
}

export async function getProject(token: string, projectId: string): Promise<CommonApiResponse<Project>> {
  return httpClient<Project>(`/projects/${projectId}`, { token });
}

export async function addProject(
  tenantId: string,
  token: string,
  clientId: string,
  newProject: NewProject
): Promise<CommonApiResponse<ApiAddResponseData>> {
  const { clientId: _, ...projectData } = newProject; // Destructure to remove clientId
  return httpClient<ApiAddResponseData>(`/projects/${tenantId}/${clientId}/add`, {
    method: 'POST',
    token,
    data: projectData,
  });
}

export async function updateProject(
  token: string,
  projectId: string,
  updatedProject: Partial<NewProject>
): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/projects/${projectId}`, {
    method: 'PUT',
    token,
    data: updatedProject,
  });
}

export async function deleteProject(token: string, projectId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/projects/${projectId}`, {
    method: 'DELETE',
    token,
  });
}
