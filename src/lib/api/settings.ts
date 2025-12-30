
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

export interface GeneralSettings {
  currency: string;
  dateFormat: string;
  amountFormat: string;
  logoUrl: string;
}

export async function getSmtpSettings(tenantId: string, token: string): Promise<CommonApiResponse<EmailSmtpSettings>> {
  return httpClient<EmailSmtpSettings>(`/setting/${tenantId}/settings/smtp`, { token });
}

export async function updateSmtpSettings(tenantId: string, token: string, settings: Partial<EmailSmtpSettings>): Promise<CommonApiResponse<EmailSmtpSettings>> {
  return httpClient<EmailSmtpSettings>(`/setting/${tenantId}/settings/smtp`, {
    method: 'PUT',
    token,
    data: settings,
  });
}

export async function getEmailSettings(tenantId: string, token: string): Promise<CommonApiResponse<EmailSettings>> {
  return httpClient<EmailSettings>(`/setting/${tenantId}/settings/email`, { token });
}

export async function updateEmailSettings(tenantId: string, token: string, settings: Partial<EmailSettings>): Promise<CommonApiResponse<EmailSettings>> {
  return httpClient<EmailSettings>(`/setting/${tenantId}/settings/email`, {
    method: 'PUT',
    token,
    data: settings,
  });
}

export async function getGeneralSettings(activeProfileId: string, activeProfile: string, token: string): Promise<CommonApiResponse<GeneralSettings>> {
  return httpClient<GeneralSettings>(`/setting/${activeProfileId}/${activeProfile}/settings_general`, { token });
}

export async function updateGeneralSettings(
  activeProfileId: string, activeProfile: string,
  token: string,
  settings: Partial<GeneralSettings>
): Promise<CommonApiResponse<GeneralSettings>> {
  return httpClient<GeneralSettings>(`/setting/${activeProfileId}/${activeProfile}/settings_general`, {
    method: 'PUT',
    token,
    data: settings,
  });
}
