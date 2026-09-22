import type {
  TaskStatus,
  UrgencyLevel,
} from "./taskEnums";


// =====================================================
// RECORRÊNCIA
// =====================================================

export type RecurrenceType =
  | "nenhuma"
  | "diaria"
  | "semanal"
  | "mensal";


// =====================================================
// TAREFA
// =====================================================

export interface Task {
  id: number;

  title: string;

  description: string | null;

  urgency: UrgencyLevel;

  status: TaskStatus;

  // ===================================================
  // DEPARTAMENTO
  // ===================================================

  department_id: number;

  // ===================================================
  // AGENDAMENTO
  // ===================================================

  scheduled_date: string;

  scheduled_time: string | null;

  // ===================================================
  // LOCALIZAÇÃO
  // ===================================================

  building: string | null;

  block: string | null;

  apartment: string | null;

  // ===================================================
  // RECORRÊNCIA
  // ===================================================

  is_recurring: boolean;

  recurrence_type: RecurrenceType;

  recurrence_interval: number | null;

  next_recurrence_date: string | null;

  // ===================================================
  // CONCLUSÃO
  // ===================================================

  completed_at: string | null;

  // ===================================================
  // AUTORIA
  // ===================================================

  user_id: number;

  // ===================================================
  // AUDITORIA
  // ===================================================

  created_at: string;

  updated_at: string;
}


// =====================================================
// CRIAÇÃO DE TAREFA
// =====================================================

export interface CreateTaskRequest {
  title: string;

  description?: string | null;

  urgency: UrgencyLevel;

  // ===================================================
  // DEPARTAMENTO
  // ===================================================

  department_id: number;

  // ===================================================
  // AGENDAMENTO
  // ===================================================

  scheduled_date: string;

  scheduled_time?: string | null;

  // ===================================================
  // LOCALIZAÇÃO
  // ===================================================

  building?: string | null;

  block?: string | null;

  apartment?: string | null;

  // ===================================================
  // RECORRÊNCIA
  // ===================================================

  is_recurring?: boolean;

  recurrence_type?: RecurrenceType;

  recurrence_interval?: number | null;
}


// =====================================================
// ATUALIZAÇÃO DE TAREFA
// =====================================================

export interface UpdateTaskRequest {
  title?: string;

  description?: string | null;

  urgency?: UrgencyLevel;

  status?: TaskStatus;

  // ===================================================
  // DEPARTAMENTO
  // ===================================================

  department_id?: number;

  // ===================================================
  // AGENDAMENTO
  // ===================================================

  scheduled_date?: string;

  scheduled_time?: string | null;

  // ===================================================
  // LOCALIZAÇÃO
  // ===================================================

  building?: string | null;

  block?: string | null;

  apartment?: string | null;

  // ===================================================
  // RECORRÊNCIA
  // ===================================================

  is_recurring?: boolean;

  recurrence_type?: RecurrenceType;

  recurrence_interval?: number | null;
}