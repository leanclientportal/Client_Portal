import { httpClient } from "./http-client";
import type { DashboardWidgetsResponse, DashboardOverviewResponse } from "@/models/dashboard";
import type { CommonApiResponse } from "@/lib/types";

export async function getDashboardWidgets(token: string, activeProfileId: string): Promise<CommonApiResponse<DashboardWidgetsResponse>> {
  return httpClient<DashboardWidgetsResponse>(`/dashboard/${activeProfileId}`, { token });
}

export async function getDashboardOverview(token: string, tenantId: string): Promise<CommonApiResponse<DashboardOverviewResponse>> {
  return httpClient<DashboardOverviewResponse>(`/dashboard/overview/${tenantId}`, { token });
}
