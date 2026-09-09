export interface UrgencySummary {
  baixa: number;
  media: number;
  alta: number;
}

export interface DashboardSummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  by_urgency: UrgencySummary;
  completion_percentage: number;
}