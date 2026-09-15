import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteTask, getTasks, updateTask } from "../services/tasks";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import type { Task } from "../types/task";

/* =========================================================
   DATE HELPERS
========================================================= */

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getStartOfWeek(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function formatDayHeading(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const today = getLocalDateString();
  const tomorrow = getLocalDateString(addDays(new Date(), 1));
  const yesterday = getLocalDateString(addDays(new Date(), -1));

  if (dateString === today) {
    return "Hoje";
  }

  if (dateString === tomorrow) {
    return "Amanhã";
  }

  if (dateString === yesterday) {
    return "Ontem";
  }

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatTime(time: string | null): string {
  if (!time) {
    return "--:--";
  }

  return time.slice(0, 5);
}

/* =========================================================
   URGENCY
========================================================= */

function getUrgencyLabel(urgency: Task["urgency"]): string {
  if (urgency === "alta") {
    return "Alta";
  }

  if (urgency === "media") {
    return "Média";
  }

  return "Baixa";
}

function getUrgencyPill(urgency: Task["urgency"]): string {
  if (urgency === "alta") {
    return "bg-red-50 text-red-600";
  }

  if (urgency === "media") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-blue-50 text-blue-600";
}

function getUrgencyDot(urgency: Task["urgency"]): string {
  if (urgency === "alta") {
    return "bg-red-500";
  }

  if (urgency === "media") {
    return "bg-amber-400";
  }

  return "bg-blue-500";
}

/* =========================================================
   MANUTENÇÃO

   Ajuste esta função para o campo real do seu backend.
   Hoje ela aceita: is_maintenance, type === "manutencao"
   ou category === "manutencao".
========================================================= */

function isMaintenanceTask(task: Task): boolean {
  const raw = task as unknown as {
    is_maintenance?: boolean;
    type?: string;
    category?: string;
  };

  return (
    raw.is_maintenance === true ||
    raw.type === "manutencao" ||
    raw.category === "manutencao"
  );
}

/* =========================================================
   FILTER TYPES
========================================================= */

type UrgencyFilter = "todas" | Task["urgency"];
type PeriodFilter = "todas" | "hoje" | "semana" | "atrasadas";
type StatusFilter = "todas" | "pendente" | "concluida";
type KindFilter = "todas" | "manutencao" | "gerais";

const urgencyOptions: { value: UrgencyFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: "todas", label: "Todo o período" },
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Por semana" },
  { value: "atrasadas", label: "Atrasadas" },
];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "concluida", label: "Concluídas" },
];

const kindOptions: { value: KindFilter; label: string }[] = [
  { value: "todas", label: "Tudo" },
  { value: "manutencao", label: "Manutenções" },
  { value: "gerais", label: "Demais tarefas" },
];

/* =========================================================
   SELECT
========================================================= */

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
      <span className="text-xs font-medium text-slate-400">{label}</span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 sm:w-[170px]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}

/* =========================================================
   TASKS PAGE
========================================================= */

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState<UrgencyFilter>("todas");
  const [period, setPeriod] = useState<PeriodFilter>("todas");
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [kind, setKind] = useState<KindFilter>("todas");

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek());

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    async function loadTasks() {
      try {
        const allTasks = await getTasks();
        setTasks(allTasks);
      } catch (loadError) {
        if (
          axios.isAxiosError(loadError) &&
          loadError.response?.status === 401
        ) {
          setRedirecting(true);
          return;
        }

        setError("Não foi possível carregar as tarefas.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    if (!redirecting) {
      return;
    }

    navigate("/login", { replace: true });
  }, [redirecting, navigate]);

  /* =======================================================
     CLOSE MENU ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }

    function handleClickOutside() {
      setOpenMenuId(null);
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  async function handleToggleTask(task: Task) {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";

    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch {
      setError("Não foi possível atualizar a tarefa.");
    }
  }

  function handleEditTask(task: Task) {
    setOpenMenuId(null);
    navigate(`/tasks/${task.id}/edit`);
  }

  async function handleDeleteTask(task: Task) {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      `Deseja realmente excluir a tarefa "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(task.id);

      setTasks((currentTasks) =>
        currentTasks.filter((currentTask) => currentTask.id !== task.id),
      );
    } catch {
      setError("Não foi possível excluir a tarefa.");
    }
  }

  function clearFilters() {
    setSearch("");
    setUrgency("todas");
    setPeriod("todas");
    setStatus("todas");
    setKind("todas");
    setWeekStart(getStartOfWeek());
  }

  /* =======================================================
     FILTERING
  ======================================================= */

  const todayString = getLocalDateString();

  const weekStartString = getLocalDateString(weekStart);
  const weekEndString = getLocalDateString(addDays(weekStart, 6));

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (urgency !== "todas" && task.urgency !== urgency) {
          return false;
        }

        if (status !== "todas" && task.status !== status) {
          return false;
        }

        if (kind === "manutencao" && !isMaintenanceTask(task)) {
          return false;
        }

        if (kind === "gerais" && isMaintenanceTask(task)) {
          return false;
        }

        if (period === "hoje" && task.scheduled_date !== todayString) {
          return false;
        }

        if (
          period === "semana" &&
          (task.scheduled_date < weekStartString ||
            task.scheduled_date > weekEndString)
        ) {
          return false;
        }

        if (
          period === "atrasadas" &&
          !(task.scheduled_date < todayString && task.status !== "concluida")
        ) {
          return false;
        }

        if (term) {
          const haystack = [task.title, task.building, task.block, task.apartment]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(term)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return a.scheduled_date.localeCompare(b.scheduled_date);
        }

        return (a.scheduled_time ?? "99:99").localeCompare(
          b.scheduled_time ?? "99:99",
        );
      });
  }, [
    tasks,
    search,
    urgency,
    status,
    kind,
    period,
    todayString,
    weekStartString,
    weekEndString,
  ]);

  /* =======================================================
     GROUP BY DAY
  ======================================================= */

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, Task[]>();

    filteredTasks.forEach((task) => {
      const current = groups.get(task.scheduled_date) ?? [];
      current.push(task);
      groups.set(task.scheduled_date, current);
    });

    return Array.from(groups.entries());
  }, [filteredTasks]);

  /* =======================================================
     COUNTERS
  ======================================================= */

  const pendingCount = filteredTasks.filter(
    (task) => task.status !== "concluida",
  ).length;

  const completedCount = filteredTasks.length - pendingCount;

  const maintenanceCount = filteredTasks.filter(isMaintenanceTask).length;

  const hasActiveFilters =
    search.trim() !== "" ||
    urgency !== "todas" ||
    period !== "todas" ||
    status !== "todas" ||
    kind !== "todas";

  /* =======================================================
     LOADING / ERROR
  ======================================================= */

  if (loading || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-[#e8eefb]">
        <div className="flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-5 text-sm font-medium text-slate-500">
            {redirecting
              ? "Sessão expirada. Redirecionando..."
              : "Carregando suas tarefas..."}
          </p>
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
                  Tarefas
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "tarefa" : "tarefas"} ·{" "}
                  {pendingCount} pendentes · {completedCount} concluídas
                  {maintenanceCount > 0 && ` · ${maintenanceCount} de manutenção`}
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
                ERROR
            ============================================= */}

            {error && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* =============================================
                FILTERS
            ============================================= */}

            <section className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                  {/* SEARCH */}

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-slate-400">
                      Buscar
                    </span>

                    <div className="relative">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>

                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Título, prédio ou apartamento"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-700 transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 sm:w-[260px]"
                      />
                    </div>
                  </label>

                  <FilterSelect
                    label="Urgência"
                    value={urgency}
                    options={urgencyOptions}
                    onChange={setUrgency}
                  />

                  <FilterSelect
                    label="Período"
                    value={period}
                    options={periodOptions}
                    onChange={setPeriod}
                  />

                  <FilterSelect
                    label="Tipo"
                    value={kind}
                    options={kindOptions}
                    onChange={setKind}
                  />

                  <FilterSelect
                    label="Situação"
                    value={status}
                    options={statusOptions}
                    onChange={setStatus}
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-start text-sm font-medium text-blue-600 transition hover:text-blue-700 xl:self-end xl:pb-2.5"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {/* WEEK STEPPER */}

              {period === "semana" && (
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setWeekStart((current) => addDays(current, -7))}
                    aria-label="Semana anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
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

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatWeekRange(weekStart)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {weekStartString === getLocalDateString(getStartOfWeek())
                        ? "Semana atual"
                        : "Outra semana"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWeekStart((current) => addDays(current, 7))}
                    aria-label="Próxima semana"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
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

                  <button
                    type="button"
                    onClick={() => setWeekStart(getStartOfWeek())}
                    className="ml-auto text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Semana atual
                  </button>
                </div>
              )}
            </section>

            {/* =============================================
                LIST
            ============================================= */}

            <section className="mt-5 space-y-5">
              {groupedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/70 bg-white/90 px-6 py-16 text-center shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="17" rx="3" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>

                  <p className="mt-4 text-[15px] font-medium text-slate-700">
                    {hasActiveFilters
                      ? "Nenhuma tarefa com esses filtros"
                      : "Você ainda não tem tarefas"}
                  </p>

                  <button
                    type="button"
                    onClick={
                      hasActiveFilters ? clearFilters : () => navigate("/tasks/new")
                    }
                    className="mt-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    {hasActiveFilters ? "Limpar filtros" : "Criar a primeira tarefa"}
                  </button>
                </div>
              ) : (
                groupedTasks.map(([date, dayTasks]) => (
                  <div
                    key={date}
                    className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                        {formatDayHeading(date)}
                      </h2>

                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-500">
                        {dayTasks.length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-3 transition duration-200 hover:bg-slate-100/80 sm:px-4"
                        >
                          {/* CHECKBOX */}

                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            aria-label={
                              task.status === "concluida"
                                ? "Reabrir tarefa"
                                : "Concluir tarefa"
                            }
                            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                              task.status === "concluida"
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white hover:border-slate-500"
                            }`}
                          >
                            {task.status === "concluida" && (
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 12l4 4L19 6" />
                              </svg>
                            )}
                          </button>

                          {/* TITLE */}

                          <button
                            type="button"
                            onClick={() => handleEditTask(task)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className={`truncate text-[15px] font-medium ${
                                  task.status === "concluida"
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </span>

                              {isMaintenanceTask(task) && (
                                <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                                  Manutenção
                                </span>
                              )}
                            </span>

                            {task.building && (
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {task.building}
                                {task.block ? ` • Bloco ${task.block}` : ""}
                                {task.apartment ? ` • AP ${task.apartment}` : ""}
                              </p>
                            )}
                          </button>

                          {/* URGENCY */}

                          <span
                            className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${getUrgencyPill(
                              task.urgency,
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getUrgencyDot(
                                task.urgency,
                              )}`}
                            />
                            {getUrgencyLabel(task.urgency)}
                          </span>

                          <span className="hidden w-14 shrink-0 text-right text-sm font-medium text-slate-500 sm:block">
                            {formatTime(task.scheduled_time)}
                          </span>

                          {/* MENU */}

                          <div
                            className="relative shrink-0"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === task.id ? null : task.id,
                                )
                              }
                              aria-label="Opções da tarefa"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-200/60 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <circle cx="12" cy="5" r="1.6" />
                                <circle cx="12" cy="12" r="1.6" />
                                <circle cx="12" cy="19" r="1.6" />
                              </svg>
                            </button>

                            {openMenuId === task.id && (
                              <div className="absolute right-0 top-9 z-30 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                                <button
                                  type="button"
                                  onClick={() => handleEditTask(task)}
                                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(task)}
                                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-500 transition hover:bg-red-50"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Tasks;