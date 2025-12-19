// src/lib/api/documents.ts

import { httpClient } from './http-client';
import type {
  GetDocumentsResponse,
  NewDocument,
  ApiAddResponseData,
  CommonApiResponse,
} from '../types';

export async function getDocuments(token: string, projectId: string): Promise<CommonApiResponse<GetDocumentsResponse>> {
  return httpClient<GetDocumentsResponse>(`/documents/${projectId}`, { token });
}

export async function addDocument(token: string, projectId: string, newDocument: NewDocument): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/documents/${projectId}`, {
    method: 'POST',
    token,
    data: newDocument,
  });
}

export async function deleteDocument(token: string, projectId: string, documentId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/documents/${projectId}/${documentId}`, {
    method: 'DELETE',
    token,
  });
}

export async function updateDocument(token: string, projectId: string, documentId: string, updatedDocument: Partial<NewDocument>): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/documents/${projectId}/${documentId}`, {
    method: 'PUT',
    token,
    data: updatedDocument,
  });
}
