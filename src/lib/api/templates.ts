import { httpClient } from './http-client';
import {
  Template,
  GetTemplatesResponse,
  NewTemplate,
  CommonApiResponse,
  EmailTemplateType,
} from '../types';

export async function getTemplates(tenantId: string, token: string, page: number, limit: number, search?: string): Promise<CommonApiResponse<GetTemplatesResponse>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) {
    params.append('search', search);
  }
  return httpClient<GetTemplatesResponse>(`/email-templates/${tenantId}?${params.toString()}`, { token });
}

export async function getTemplate(tenantId: string, templateId: string, token: string): Promise<CommonApiResponse<Template>> {
  return httpClient<Template>(`/email-templates/${tenantId}/${templateId}`, { token });
}

export async function createTemplate(tenantId: string, token: string, data: NewTemplate): Promise<CommonApiResponse<Template>> {
    return httpClient<Template>(`/email-templates/${tenantId}`, { method: 'POST', data, token });
}

export async function updateTemplate(tenantId: string, templateId: string, token: string, data: Partial<NewTemplate>): Promise<CommonApiResponse<Template>> {
    return httpClient<Template>(`/email-templates/${tenantId}/${templateId}`, { method: 'PUT', data, token });
}

export async function deleteTemplate(tenantId: string, templateId: string, token: string): Promise<CommonApiResponse<null>> {
    return httpClient<null>(`/email-templates/${tenantId}/${templateId}`, { method: 'DELETE', token });
}

export async function getTemplateVariables(token: string): Promise<CommonApiResponse<EmailTemplateType[]>> {
    return httpClient<EmailTemplateType[]>(`/email-templates/types`, { token });
}
