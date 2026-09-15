import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTodayDashboard } from "../services/dashboard";
import { deleteTask, getTasks, updateTask } from "../services/tasks";
import { getCurrentUser } from "../services/user";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import type { UserResponse } from "../types/auth";
import type { DashboardSummary } from "../types/dashboard";
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

function formatToday(): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatDateShort(dateString: string): string {
  const [, month, day] = dateString.split("-");
  return `${day}/${month}`;
}

function formatTime(time: string | null): string {
  if (!time) {
    return "--:--";
  }

  return time.slice(0, 5);
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia,";
  }

  if (hour < 18) {
    return "Boa tarde,";
  }

  return "Boa noite,";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "👋";
  }

  if (hour < 18) {
    return "☀️";
  }

  return "🌙";
}

function getWeekDays(): Date[] {
  const monday = getStartOfWeek();
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function getWeekdayLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(date)
    .replace(".", "");

  return label.charAt(0).toUpperCase() + label.slice(1);
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
   BACKGROUND IMAGE
========================================================= */

const architectureImage =
  "https://images.unsplash.com/photo-1779466287434-b283790a69cc?auto=format&fit=crop&q=85&w=1600";

/* =========================================================
   SMALL UI PIECES
========================================================= */

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
  progress?: number;
};

function MetricCard({
  label,
  value,
  hint,
  icon,
  iconClass,
  valueClass,
  progress,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </span>

        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>

      <p
        className={`mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] ${
          valueClass ?? "text-slate-900"
        }`}
      >
        {value}
      </p>

      {typeof progress === "number" ? (
        <>
          <p className="mt-2 text-xs text-slate-400">{hint}</p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

type TaskMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function TaskMenu({ isOpen, onToggle, onEdit, onDelete }: TaskMenuProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Opções da tarefa"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-30 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          <button
            type="button"
            onClick={onEdit}
            className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-500 transition hover:bg-red-50"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

type SectionCardProps = {
  title: string;
  count: number;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
};

function SectionCard({
  title,
  count,
  subtitle,
  actionLabel,
  onAction,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
              {title}
            </h2>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-500">
              {count}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          {actionLabel}
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>

      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [currentUser, summary, allTasks] = await Promise.all([
          getCurrentUser(),
          getTodayDashboard(),
          getTasks(),
        ]);

        setUser(currentUser);
        setDashboard(summary);
        setTasks(allTasks);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setRedirecting(true);
          return;
        }

        setError("Não foi possível carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =======================================================
     REDIRECT
  ======================================================= */

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
     TOGGLE TASK
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

      const updatedSummary = await getTodayDashboard();
      setDashboard(updatedSummary);
    } catch {
      setError("Não foi possível atualizar a tarefa.");
    }
  }

  /* =======================================================
     EDIT TASK
  ======================================================= */

  function handleEditTask(task: Task) {
    setOpenMenuId(null);
    navigate(`/tasks/${task.id}/edit`);
  }

  /* =======================================================
     DELETE TASK
  ======================================================= */

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

      const updatedSummary = await getTodayDashboard();
      setDashboard(updatedSummary);
    } catch {
      setError("Não foi possível excluir a tarefa.");
    }
  }

  /* =======================================================
     BASIC DATA
  ======================================================= */

  const completedPercentage = dashboard?.completion_percentage ?? 0;
  const firstName = user?.name.split(" ")[0] ?? "Usuário";
  const todayString = getLocalDateString(new Date());

  /* =======================================================
     TODAY TASKS
  ======================================================= */

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.scheduled_date === todayString)
      .sort((a, b) => {
        if (a.status === "concluida" && b.status !== "concluida") {
          return 1;
        }

        if (a.status !== "concluida" && b.status === "concluida") {
          return -1;
        }

        return (a.scheduled_time ?? "99:99").localeCompare(
          b.scheduled_time ?? "99:99",
        );
      });
  }, [tasks, todayString]);

  /* =======================================================
     UPCOMING TASKS
  ======================================================= */

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => task.scheduled_date > todayString)
      .sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return a.scheduled_date.localeCompare(b.scheduled_date);
        }

        return (a.scheduled_time ?? "99:99").localeCompare(
          b.scheduled_time ?? "99:99",
        );
      })
      .slice(0, 5);
  }, [tasks, todayString]);

  /* =======================================================
     WEEK
  ======================================================= */

  const weekDays = useMemo(() => getWeekDays(), []);

  const selectedDayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.scheduled_date === selectedDate)
      .sort((a, b) =>
        (a.scheduled_time ?? "99:99").localeCompare(
          b.scheduled_time ?? "99:99",
        ),
      );
  }, [tasks, selectedDate]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <div className="flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-5 text-sm font-medium text-slate-500">
            {redirecting
              ? "Sessão expirada. Redirecionando..."
              : "Carregando seu workspace..."}
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !user || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50 px-4">
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
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <DashboardSidebar />

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="min-w-0 flex-1">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="relative overflow-hidden">
            {/* Imagem de arquitetura no canto superior direito */}
            <div className="pointer-events-none absolute right-0 top-0 hidden h-[230px] w-[46%] xl:block">
              <img
                src={architectureImage}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#f4f7fd] via-[#f4f7fd]/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#eef2fb] to-transparent" />
            </div>

            <div className="relative mx-auto max-w-[1380px] px-5 pb-2 pt-7 sm:px-8 lg:px-10 xl:px-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500">{formatToday()}</p>

                  <p className="mt-3 text-[2.1rem] font-light leading-none tracking-[-0.03em] text-slate-400 sm:text-[2.4rem]">
                    {getGreeting()}
                  </p>

                  <h1 className="mt-2 flex items-center gap-3 text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-slate-900 sm:text-[3.1rem]">
                    {firstName}.
                    <span aria-hidden="true" className="text-[2.2rem]">
                      {getGreetingEmoji()}
                    </span>
                  </h1>

                  <p className="mt-4 max-w-md text-[15px] leading-6 text-slate-500">
                    Aqui está o que precisa da sua atenção hoje.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-6 lg:items-end lg:pt-10">
                  <p className="hidden max-w-[210px] text-right text-[11px] font-medium leading-5 tracking-[0.14em] text-slate-400 xl:block">
                    Organização torna grandes resultados possíveis.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/tasks/new")}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-[15px] font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
                  >
                    <span className="text-lg font-light leading-none">+</span>
                    Nova tarefa
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1380px] px-5 pb-10 pt-6 sm:px-8 lg:px-10 xl:px-12">
            {/* =================================================
                METRICS
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total de tarefas"
                value={String(dashboard.total)}
                hint="programadas para hoje"
                iconClass="bg-indigo-50 text-indigo-500"
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                }
              />

              <MetricCard
                label="Concluídas"
                value={String(dashboard.completed)}
                hint={`${completedPercentage}% de conclusão`}
                valueClass="text-slate-900"
                iconClass="bg-emerald-50 text-emerald-500"
                progress={completedPercentage}
                icon={
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
                }
              />

              <MetricCard
                label="Pendentes"
                value={String(dashboard.pending)}
                hint="precisam da sua atenção"
                iconClass="bg-amber-50 text-amber-500"
                icon={
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
                }
              />

              <MetricCard
                label="Progresso"
                value={`${completedPercentage}%`}
                hint="do dia já finalizado"
                iconClass="bg-violet-50 text-violet-500"
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M7 16V10M12 16V6M17 16v-4" />
                    <path d="M4 20h16" />
                  </svg>
                }
              />
            </section>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
              {/* =============================================
                  LEFT COLUMN
              ============================================= */}

              <div className="min-w-0 space-y-5">
                {/* TAREFAS DE HOJE */}

                <SectionCard
                  title="Tarefas de hoje"
                  count={todayTasks.length}
                  subtitle={formatToday()}
                  actionLabel="Ver todas"
                  onAction={() => navigate("/tasks")}
                >
                  {todayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 px-6 py-10 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Seu dia está livre
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/tasks/new")}
                        className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Criar a primeira tarefa
                      </button>
                    </div>
                  ) : (
                    todayTasks.map((task) => (
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

                        {/* TASK */}

                        <button
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p
                            className={`truncate text-[15px] font-medium ${
                              task.status === "concluida"
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </p>

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

                        <div onClick={(event) => event.stopPropagation()}>
                          <TaskMenu
                            isOpen={openMenuId === task.id}
                            onToggle={() =>
                              setOpenMenuId(
                                openMenuId === task.id ? null : task.id,
                              )
                            }
                            onEdit={() => handleEditTask(task)}
                            onDelete={() => handleDeleteTask(task)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </SectionCard>

                {/* PRÓXIMAS TAREFAS */}

                <SectionCard
                  title="Próximas tarefas"
                  count={upcomingTasks.length}
                  subtitle="Nos próximos dias"
                  actionLabel="Ver todas"
                  onAction={() => navigate("/tasks")}
                >
                  {upcomingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 px-6 py-10 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <rect x="3" y="4" width="18" height="17" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Nada agendado ainda
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/tasks/new")}
                        className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Planejar os próximos dias
                      </button>
                    </div>
                  ) : (
                    upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition duration-200 hover:bg-slate-50 sm:px-4"
                      >
                        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white" />

                        <button
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-[15px] font-medium text-slate-900">
                            {task.title}
                          </p>

                          {task.building && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {task.building}
                              {task.block ? ` • Bloco ${task.block}` : ""}
                              {task.apartment ? ` • AP ${task.apartment}` : ""}
                            </p>
                          )}
                        </button>

                        <span className="shrink-0 text-sm font-medium text-slate-500">
                          {formatDateShort(task.scheduled_date)}
                        </span>

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

                        <div onClick={(event) => event.stopPropagation()}>
                          <TaskMenu
                            isOpen={openMenuId === task.id}
                            onToggle={() =>
                              setOpenMenuId(
                                openMenuId === task.id ? null : task.id,
                              )
                            }
                            onEdit={() => handleEditTask(task)}
                            onDelete={() => handleDeleteTask(task)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </SectionCard>
              </div>

              {/* =============================================
                  RIGHT COLUMN
              ============================================= */}

              <div className="space-y-5">
                {/* CALENDÁRIO DA SEMANA */}

                <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                      Calendário da semana
                    </h2>

                    <button
                      type="button"
                      onClick={() => navigate("/calendar")}
                      className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Ver agenda
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1.5">
                    {weekDays.map((day) => {
                      const dayString = getLocalDateString(day);
                      const isSelected = dayString === selectedDate;
                      const isToday = dayString === todayString;

                      const dayTasks = tasks.filter(
                        (task) => task.scheduled_date === dayString,
                      );

                      return (
                        <button
                          key={dayString}
                          type="button"
                          onClick={() => setSelectedDate(dayString)}
                          aria-pressed={isSelected}
                          className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                            isSelected
                              ? "bg-slate-900 text-white shadow-[0_6px_16px_rgba(15,23,42,0.22)]"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`text-[11px] font-medium ${
                              isSelected ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {getWeekdayLabel(day)}
                          </span>

                          <span
                            className={`text-[15px] font-semibold ${
                              isSelected
                                ? "text-white"
                                : isToday
                                  ? "text-blue-600"
                                  : "text-slate-800"
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              dayTasks.length === 0
                                ? "bg-transparent"
                                : isSelected
                                  ? "bg-white"
                                  : "bg-blue-500"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    {selectedDayTasks.length === 0 ? (
                      <p className="py-2 text-sm text-slate-400">
                        Nenhuma tarefa neste dia.
                      </p>
                    ) : (
                      selectedDayTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${getUrgencyDot(
                              task.urgency,
                            )}`}
                          />

                          <span
                            className={`min-w-0 flex-1 truncate text-sm ${
                              task.status === "concluida"
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {task.title}
                          </span>

                          <span className="shrink-0 text-sm text-slate-400">
                            {formatTime(task.scheduled_time)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </section>

                {/* CARD DE DESTAQUE */}

                <button
                  type="button"
                  onClick={() => navigate("/apartments")}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-[#eef2fb] to-[#dfe7f8] p-6 text-left shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition duration-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
                >
                  <img
                    src={architectureImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute -right-6 bottom-0 h-[72%] w-[58%] rounded-tl-[60px] object-cover opacity-90 transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#eef2fb] via-[#eef2fb]/85 to-transparent" />

                  <div className="relative max-w-[62%]">
                    <p className="text-[22px] font-medium leading-tight tracking-[-0.02em] text-slate-900">
                      Pequenas tarefas hoje, grandes resultados amanhã.
                    </p>

                    <div className="mt-6 h-px w-10 bg-slate-300" />

                    <p className="mt-3 text-xs text-slate-500">Simple Task</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;