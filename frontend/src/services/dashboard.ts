import { api } from "./api";
import type { DashboardSummary } from "../types/dashboard";

export async function getTodayDashboard(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>(
    "/dashboard/today",
  );

  return response.data;
}