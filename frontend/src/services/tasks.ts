import { api } from "./api";

import type {
  CreateTaskRequest,
  Task,
} from "../types/task";

import type {
  TaskStatus,
  UrgencyLevel,
} from "../types/taskEnums";


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

  recurrence_interval_months?: number | null;
}


export async function createTask(
  data: CreateTaskRequest,
): Promise<Task> {
  const response = await api.post<Task>(
    "/tasks",
    data,
  );

  return response.data;
}


export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>(
    "/tasks",
  );

  return response.data;
}


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


export async function deleteTask(
  taskId: number,
): Promise<void> {
  await api.delete(
    `/tasks/${taskId}`,
  );
}