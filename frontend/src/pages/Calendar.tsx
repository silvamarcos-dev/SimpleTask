import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { getCalendarTasks } from "../services/calendar";
import { deleteTask } from "../services/tasks";
import { getCurrentUser } from "../services/user";

import type { Task } from "../types/task";
import type { UserResponse } from "../types/auth";

/* =========================================================
   DATE HELPERS
========================================================= */

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/*
 * Primeiro dia visual da grade. O calendário começa na segunda-feira.
 */
function getCalendarStart(date: Date): Date {
  const monthStart = getMonthStart(date);
  const day = monthStart.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  const start = new Date(monthStart);
  start.setDate(start.getDate() - daysFromMonday);

  return start;
}

/*
 * Último dia visual da grade. O calendário termina no domingo.
 */
function getCalendarEnd(date: Date): Date {
  const monthEnd = getMonthEnd(date);
  const day = monthEnd.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;

  const end = new Date(monthEnd);
  end.setDate(end.getDate() + daysUntilSunday);

  return end;
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTaskTime(time: string | null | undefined): string {
  if (!time) {
    return "";
  }

  return String(time).slice(0, 5);
}

/* =========================================================
   CALENDAR
========================================================= */

function Calendar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState(getMonthStart(new Date()));

  /* =======================================================
     LOAD CALENDAR
  ======================================================= */

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      setError("");

      try {
        const monthStart = getMonthStart(currentMonth);
        const monthEnd = getMonthEnd(currentMonth);

        const [currentUser, calendarData] = await Promise.all([
          getCurrentUser(),
          getCalendarTasks(
            getLocalDateString(monthStart),
            getLocalDateString(monthEnd),
          ),
        ]);

        const allTasks = calendarData.days.flatMap((day) => day.tasks);

        setUser(currentUser);
        setTasks(allTasks);
      } catch {
        setError("Não foi possível carregar o calendário.");
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, [currentMonth]);

  /* =======================================================
     DELETE TASK
  ======================================================= */

  async function handleDeleteTask(taskId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta tarefa?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(taskId);
    setError("");

    try {
      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch {
      setError("Não foi possível excluir a tarefa.");
    } finally {
      setDeletingTaskId(null);
    }
  }

  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const calendarDays = useMemo(() => {
    const start = getCalendarStart(currentMonth);
    const end = getCalendarEnd(currentMonth);

    const days: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  /* =======================================================
     TASKS BY DATE
  ======================================================= */

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    for (const task of tasks) {
      if (!task || !task.scheduled_date) {
        continue;
      }

      if (!grouped[task.scheduled_date]) {
        grouped[task.scheduled_date] = [];
      }

      grouped[task.scheduled_date].push(task);
    }

    for (const date of Object.keys(grouped)) {
      grouped[date].sort((a, b) => {
        const timeA = a?.scheduled_time ? String(a.scheduled_time) : "";
        const timeB = b?.scheduled_time ? String(b.scheduled_time) : "";

        if (timeA && timeB) {
          return timeA.localeCompare(timeB);
        }

        if (timeA) {
          return -1;
        }

        if (timeB) {
          return 1;
        }

        const titleA = a?.title ? String(a.title) : "";
        const titleB = b?.title ? String(b.title) : "";

        return titleA.localeCompare(titleB);
      });
    }

    return grouped;
  }, [tasks]);

  /* =======================================================
     TODAY
  ======================================================= */

  const todayString = getLocalDateString(new Date());

  const isCurrentMonthView =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  function handlePreviousMonth() {
    setCurrentMonth(addMonths(currentMonth, -1));
  }

  function handleNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function handleToday() {
    setCurrentMonth(getMonthStart(new Date()));
  }

  /* =======================================================
     TASK STYLE
  ======================================================= */

  function getUrgencyClass(task: Task): string {
    if (task.urgency === "alta") {
      return "bg-red-50 text-red-700 hover:bg-red-100";
    }

    if (task.urgency === "media") {
      return "bg-amber-50 text-amber-700 hover:bg-amber-100";
    }

    return "bg-blue-50 text-blue-700 hover:bg-blue-100";
  }

  function getUrgencyDotClass(task: Task): string {
    if (task.urgency === "alta") {
      return "bg-red-500";
    }

    if (task.urgency === "media") {
      return "bg-amber-400";
    }

    return "bg-blue-500";
  }

  /* =======================================================
     COUNTERS
  ======================================================= */

  const pendingCount = tasks.filter(
    (task) => task.status !== "concluida",
  ).length;

  const completedCount = tasks.length - pendingCount;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-[#e8eefb]">
        <div className="flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-5 text-sm font-medium text-slate-500">
            Carregando calendário...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-[#e8eefb] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-900">
            Não foi possível carregar
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Ocorreu um erro inesperado."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-[#e8eefb] text-slate-900">
      <div className="min-h-screen lg:flex">
        <DashboardSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1380px] px-5 py-7 sm:px-8 lg:px-10 xl:px-12">
            {/* =============================================
                HEADER
            ============================================= */}

            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.035em] text-slate-900 sm:text-[2.3rem]">
                  Calendário
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"} em{" "}
                  {formatMonthYear(currentMonth).toLowerCase()} · {pendingCount}{" "}
                  pendentes · {completedCount} concluídas
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tasks/new")}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-[15px] font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                <span className="text-lg font-light leading-none">+</span>
                Nova tarefa
              </button>
            </header>

            {/* =============================================
                CALENDAR CARD
            ============================================= */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
              {/* CONTROLS */}

              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousMonth}
                    aria-label="Mês anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <h2 className="min-w-[180px] text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    {formatMonthYear(currentMonth)}
                  </h2>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Próximo mês"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  {!isCurrentMonthView && (
                    <button
                      type="button"
                      onClick={handleToday}
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Voltar para hoje
                    </button>
                  )}
                </div>

                {/* LEGEND */}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Alta
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Média
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Baixa
                  </span>
                </div>
              </div>

              {/* GRID */}

              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* WEEK DAYS */}

                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                      (day) => (
                        <div key={day} className="px-3 py-3 text-center">
                          <span className="text-xs font-medium text-slate-400">
                            {day}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* DAYS */}

                  <div className="grid grid-cols-7">
                    {calendarDays.map((day) => {
                      const dateString = getLocalDateString(day);
                      const dayTasks = tasksByDate[dateString] ?? [];

                      const isCurrentMonth =
                        day.getMonth() === currentMonth.getMonth() &&
                        day.getFullYear() === currentMonth.getFullYear();

                      const isToday = dateString === todayString;

                      return (
                        <div
                          key={dateString}
                          className={`group relative min-h-36 border-b border-r border-slate-100 p-2 sm:min-h-40 sm:p-2.5 ${
                            isCurrentMonth ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          {/* DAY NUMBER */}

                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                isToday
                                  ? "bg-slate-900 text-white"
                                  : isCurrentMonth
                                    ? "text-slate-700"
                                    : "text-slate-300"
                              }`}
                            >
                              {day.getDate()}
                            </span>

                            {dayTasks.length > 0 && (
                              <span className="text-[10px] font-medium text-slate-300">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>

                          {/* TASKS */}

                          <div className="space-y-1.5">
                            {dayTasks.slice(0, 4).map((task) => {
                              const completed = task.status === "concluida";
                              const isDeleting = deletingTaskId === task.id;

                              return (
                                <div
                                  key={task.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    navigate(`/tasks/${task.id}/edit`)
                                  }
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      navigate(`/tasks/${task.id}/edit`);
                                    }
                                  }}
                                  className={`group/task relative cursor-pointer rounded-lg px-2 py-1.5 pr-7 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${getUrgencyClass(
                                    task,
                                  )} ${completed ? "opacity-50" : ""} ${
                                    isDeleting
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <span
                                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${getUrgencyDotClass(
                                        task,
                                      )}`}
                                    />

                                    <span
                                      className={`min-w-0 truncate text-[11px] font-medium ${
                                        completed ? "line-through" : ""
                                      }`}
                                    >
                                      {task.title || "Tarefa sem título"}
                                    </span>
                                  </div>

                                  {task.scheduled_time && (
                                    <span className="mt-0.5 block pl-3 text-[10px] opacity-70">
                                      {formatTaskTime(task.scheduled_time)}
                                    </span>
                                  )}

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    title="Excluir tarefa"
                                    aria-label={`Excluir tarefa ${task.title}`}
                                    disabled={isDeleting}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDeleteTask(task.id);
                                    }}
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md text-current transition hover:bg-white/80 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover/task:opacity-100"
                                  >
                                    {isDeleting ? (
                                      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                    ) : (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v5" />
                                        <path d="M14 11v5" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              );
                            })}

                            {/* MORE TASKS */}

                            {dayTasks.length > 4 && (
                              <button
                                type="button"
                                onClick={() => navigate("/tasks")}
                                className="w-full rounded-lg px-2 py-1 text-left text-[10px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                              >
                                + {dayTasks.length - 4} mais
                              </button>
                            )}
                          </div>

                          {/* CREATE TASK */}

                          {dayTasks.length === 0 && isCurrentMonth && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/tasks/new?date=${dateString}`)
                              }
                              aria-label={`Criar tarefa em ${dateString}`}
                              className="absolute bottom-2 right-2 hidden rounded-lg px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 group-hover:block"
                            >
                              + tarefa
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================
                RESUMO
            ============================================= */}

            <section className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
                      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
                    </svg>
                  </span>

                  <p className="text-sm font-medium text-slate-500">
                    Total no mês
                  </p>
                </div>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {tasks.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  tarefas programadas
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>

                  <p className="text-sm font-medium text-slate-500">Pendentes</p>
                </div>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {pendingCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  precisam de atenção
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
                    </svg>
                  </span>

                  <p className="text-sm font-medium text-slate-500">
                    Concluídas
                  </p>
                </div>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {completedCount}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  finalizadas no período
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Calendar;