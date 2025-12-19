// src/lib/api/invoices.ts

import { httpClient } from './http-client';
import type {
  Invoice,
  GetInvoicesResponse,
  NewInvoice,
  ApiAddResponseData,
  CommonApiResponse,
} from '../types';

export async function getInvoices(token: string, projectId: string): Promise<CommonApiResponse<GetInvoicesResponse>> {
  return httpClient<GetInvoicesResponse>(`/invoices/${projectId}`, { token });
}

export async function getInvoice(token: string, invoiceId: string): Promise<CommonApiResponse<Invoice>> {
  return httpClient<Invoice>(`/invoices/${invoiceId}`, { token });
}

export async function addInvoice(token: string, projectId: string, newInvoice: NewInvoice): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/invoices/${projectId}`, {
    method: 'POST',
    token,
    data: newInvoice,
  });
}

export async function updateInvoice(token: string, projectId: string, invoiceId: string, newInvoice: Partial<NewInvoice>): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/invoices/${projectId}/${invoiceId}`, {
    method: 'PUT',
    token,
    data: newInvoice,
  });
}

export async function deleteInvoice(token: string, projectId: string, invoiceId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/invoices/${projectId}/${invoiceId}`, {
    method: 'DELETE',
    token,
  });
}

export async function markInvoiceAsPaid(token: string, projectId: string, invoiceId: string): Promise<CommonApiResponse<ApiAddResponseData>> {
  return httpClient<ApiAddResponseData>(`/invoices/${projectId}/${invoiceId}/pay`, {
    method: 'PUT',
    token,
  });
}
