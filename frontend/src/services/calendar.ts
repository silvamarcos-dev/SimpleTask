import { api } from "./api";

import type { Task } from "../types/task";

/* =========================================================
   API TYPES
========================================================= */

export interface CalendarDay {
  date: string;
  tasks: Task[];
}

export interface CalendarResponse {
  start_date: string;
  end_date: string;
  days: CalendarDay[];
}

/* =========================================================
   GET CALENDAR TASKS
========================================================= */

export async function getCalendarTasks(
  startDate: string,
  endDate: string,
): Promise<CalendarResponse> {
  const response =
    await api.get<CalendarResponse>(
      "/calendar",
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      },
    );

  return response.data;
}