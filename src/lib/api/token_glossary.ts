import { httpClient } from "./http-client";
import type { DashboardWidgetsResponse, DashboardOverviewResponse } from "@/models/dashboard";
import type { CommonApiResponse } from "@/lib/types";
import { TokenGlossaryResponse } from "@/models/tokenglossary";

export async function getTokenGlossary(token: string): Promise<CommonApiResponse<TokenGlossaryResponse>> {
  return httpClient<TokenGlossaryResponse>(`/token-glossary`, { token });
}
