import { httpClient } from "./http-client";
import type { DashboardWidgetsResponse, DashboardOverviewResponse } from "@/models/dashboard";
import type { CommonApiResponse } from "@/lib/types";

export async function getDashboardWidgets(token: string, activeProfileId: string, activeProfile: string): Promise<CommonApiResponse<DashboardWidgetsResponse>> {
  return httpClient<DashboardWidgetsResponse>(`/dashboard/${activeProfileId}/${activeProfile}`, { token });
}

export async function getDashboardOverview(token: string, activeProfileId: string, activeProfile: string): Promise<CommonApiResponse<DashboardOverviewResponse>> {
  return httpClient<DashboardOverviewResponse>(`/dashboard/overview/${activeProfileId}/${activeProfile}`, { token });
}
