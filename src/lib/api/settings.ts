// src/lib/api/settings.ts

import { httpClient } from './http-client';
import type { CommonApiResponse } from '../types';

export interface EmailSmtpSettings {
  user: string;
  pass: string;
  service: string;
  from: string;
}

export interface EmailSettings {
  newProject: boolean;
  projectStatusChange: boolean;
  newTask: boolean;
  taskUpdate: boolean;
  documentUpload: boolean;
  invoiceUpload: boolean;
}

export async function getSmtpSettings(tenantId: string, token: string): Promise<CommonApiResponse<EmailSmtpSettings>> {
  return httpClient<EmailSmtpSettings>(`/tenant/${tenantId}/settings/smtp`, { token });
}

export async function updateSmtpSettings(tenantId: string, token: string, settings: Partial<EmailSmtpSettings>): Promise<CommonApiResponse<EmailSmtpSettings>> {
  return httpClient<EmailSmtpSettings>(`/tenant/${tenantId}/settings/smtp`, {
    method: 'PUT',
    token,
    data: settings,
  });
}

export async function getEmailSettings(tenantId: string, token: string): Promise<CommonApiResponse<EmailSettings>> {
  return httpClient<EmailSettings>(`/tenant/${tenantId}/settings/email`, { token });
}

export async function updateEmailSettings(tenantId: string, token: string, settings: Partial<EmailSettings>): Promise<CommonApiResponse<EmailSettings>> {
  return httpClient<EmailSettings>(`/tenant/${tenantId}/settings/email`, {
    method: 'PUT',
    token,
    data: settings,
  });
}
