import { api } from "./api";

import type {
  CreateTaskRequest,
  RecurrenceType,
  Task,
} from "../types/task";

import type {
  TaskStatus,
  UrgencyLevel,
} from "../types/taskEnums";


// =========================================================
// ATUALIZAÇÃO DE TAREFA
// =========================================================

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  urgency?: UrgencyLevel;
  status?: TaskStatus;
  scheduled_date?: string;
  scheduled_time?: string | null;

  // Localização
  building?: string | null;
  block?: string | null;
  apartment?: string | null;

  // Recorrência
  is_recurring?: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number | null;
}


// =========================================================
// RESPOSTA DE OCORRÊNCIA
// =========================================================

export interface TaskOccurrenceResponse {
  id: number;
  task_id: number;
  occurrence_date: string;
  status: TaskStatus;
  completed_at: string | null;
}


// =========================================================
// CRIAR TAREFA
// =========================================================

export async function createTask(
  data: CreateTaskRequest,
): Promise<Task> {
  const response = await api.post<Task>(
    "/tasks",
    data,
  );

  return response.data;
}


// =========================================================
// LISTAR TAREFAS
// =========================================================

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>(
    "/tasks",
  );

  return response.data;
}


// =========================================================
// ATUALIZAR TAREFA
// =========================================================

export async function updateTask(
  taskId: number,
  data: UpdateTaskRequest,
): Promise<Task> {
  const response = await api.patch<Task>(
    `/tasks/${taskId}`,
    data,
  );

  return response.data;
}


// =========================================================
// CONCLUIR OCORRÊNCIA
// =========================================================

export async function completeTaskOccurrence(
  taskId: number,
  occurrenceDate: string,
): Promise<TaskOccurrenceResponse> {
  const response = await api.patch<TaskOccurrenceResponse>(
    `/tasks/${taskId}/occurrence/${occurrenceDate}/complete`,
  );

  return response.data;
}


// =========================================================
// REABRIR OCORRÊNCIA
// =========================================================

export async function reopenTaskOccurrence(
  taskId: number,
  occurrenceDate: string,
): Promise<TaskOccurrenceResponse> {
  const response = await api.patch<TaskOccurrenceResponse>(
    `/tasks/${taskId}/occurrence/${occurrenceDate}/reopen`,
  );

  return response.data;
}


// =========================================================
// EXCLUIR TAREFA
// =========================================================

export async function deleteTask(
  taskId: number,
): Promise<void> {
  await api.delete(
    `/tasks/${taskId}`,
  );
}