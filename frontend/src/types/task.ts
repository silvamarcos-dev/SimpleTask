import type {
  TaskStatus,
  UrgencyLevel,
} from "./taskEnums";

export interface Task {
  id: number;

  title: string;

  description: string | null;

  urgency: UrgencyLevel;

  status: TaskStatus;

  scheduled_date: string;

  scheduled_time: string | null;

  // Localização
  building: string | null;

  block: string | null;

  apartment: string | null;

  // Recorrência
  is_recurring: boolean;

  recurrence_interval_months: number | null;

  next_recurrence_date: string | null;

  // Conclusão
  completed_at: string | null;

  user_id: number;

  created_at: string;

  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;

  description?: string | null;

  urgency: UrgencyLevel;

  scheduled_date: string;

  scheduled_time?: string | null;

  // Localização
  building?: string | null;

  block?: string | null;

  apartment?: string | null;

  // Recorrência
  is_recurring?: boolean;

  recurrence_interval_months?: number | null;
}