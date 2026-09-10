import axios from "axios";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTodayDashboard } from "../services/dashboard";
import {
  deleteTask,
  getTasks,
  updateTask,
} from "../services/tasks";
import { getCurrentUser } from "../services/user";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MetricCard from "../components/dashboard/MetricCard";
import ProgressCard from "../components/dashboard/ProgressCard";
import TaskColumn from "../components/dashboard/TaskColumn";
import UrgencyCard from "../components/dashboard/UrgencyCard";

import type { UserResponse } from "../types/auth";
import type { DashboardSummary } from "../types/dashboard";
import type { Task } from "../types/task";

/* =========================================================
   DATE HELPERS
========================================================= */

function getLocalDateString(
  date: Date = new Date(),
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  days: number,
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

function getStartOfNextWeek(): Date {
  const today = new Date();

  const dayOfWeek = today.getDay();

  const daysUntilMonday =
    dayOfWeek === 0
      ? 1
      : 8 - dayOfWeek;

  return addDays(
    today,
    daysUntilMonday,
  );
}

function formatToday(): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(new Date());
}

function formatShortDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    },
  ).format(date);
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<UserResponse | null>(
      null,
    );

  const [dashboard, setDashboard] =
    useState<DashboardSummary | null>(
      null,
    );

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [redirecting, setRedirecting] =
    useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          currentUser,
          summary,
          allTasks,
        ] = await Promise.all([
          getCurrentUser(),
          getTodayDashboard(),
          getTasks(),
        ]);

        setUser(currentUser);
        setDashboard(summary);
        setTasks(allTasks);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          setRedirecting(true);
          return;
        }

        setError(
          "Não foi possível carregar o dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =======================================================
     REDIRECT AFTER EXPIRED SESSION
  ======================================================= */

  useEffect(() => {
    if (!redirecting) {
      return;
    }

    navigate("/login", {
      replace: true,
    });
  }, [redirecting, navigate]);

  /* =======================================================
     TOGGLE TASK
  ======================================================= */

  async function handleToggleTask(
    task: Task,
  ) {
    const newStatus =
      task.status === "concluida"
        ? "pendente"
        : "concluida";

    try {
      const updatedTask =
        await updateTask(
          task.id,
          {
            status: newStatus,
          },
        );

      setTasks((currentTasks) =>
        currentTasks.map(
          (currentTask) =>
            currentTask.id ===
            updatedTask.id
              ? updatedTask
              : currentTask,
        ),
      );

      const updatedSummary =
        await getTodayDashboard();

      setDashboard(updatedSummary);
    } catch {
      setError(
        "Não foi possível atualizar a tarefa.",
      );
    }
  }

  /* =======================================================
     EDIT TASK
  ======================================================= */

  function handleEditTask(
    task: Task,
  ) {
    navigate(
      `/tasks/${task.id}/edit`,
    );
  }

  /* =======================================================
     DELETE TASK
  ======================================================= */

  async function handleDeleteTask(
    task: Task,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir a tarefa "${task.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(task.id);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) =>
            currentTask.id !== task.id,
        ),
      );

      const updatedSummary =
        await getTodayDashboard();

      setDashboard(updatedSummary);
    } catch {
      setError(
        "Não foi possível excluir a tarefa.",
      );
    }
  }

  /* =======================================================
     DASHBOARD DATA
  ======================================================= */

  const completedPercentage =
    dashboard?.completion_percentage ??
    0;

  const firstName =
    user?.name.split(" ")[0] ??
    "Usuário";

  /* =======================================================
     KANBAN DATES
  ======================================================= */

  const today = new Date();

  const todayString =
    getLocalDateString(today);

  const tomorrow =
    addDays(today, 1);

  const tomorrowString =
    getLocalDateString(
      tomorrow,
    );

  const nextWeekStart =
    getStartOfNextWeek();

  const nextWeekEnd =
    addDays(
      nextWeekStart,
      6,
    );

  const nextWeekStartString =
    getLocalDateString(
      nextWeekStart,
    );

  const nextWeekEndString =
    getLocalDateString(
      nextWeekEnd,
    );

  /* =======================================================
     KANBAN FILTERS
  ======================================================= */

  const todayTasks = tasks.filter(
    (task) =>
      task.scheduled_date ===
      todayString,
  );

  const tomorrowTasks =
    tasks.filter(
      (task) =>
        task.scheduled_date ===
        tomorrowString,
    );

  const nextWeekTasks =
    tasks.filter(
      (task) =>
        task.scheduled_date >=
          nextWeekStartString &&
        task.scheduled_date <=
          nextWeekEndString,
    );

  /* =======================================================
     KANBAN SORT
  ======================================================= */

  const sortedTodayTasks =
    useMemo(() => {
      return [...todayTasks].sort(
        (a, b) => {
          if (
            a.status ===
              "concluida" &&
            b.status !==
              "concluida"
          ) {
            return 1;
          }

          if (
            a.status !==
              "concluida" &&
            b.status ===
              "concluida"
          ) {
            return -1;
          }

          return (
            a.scheduled_time ??
            "99:99"
          ).localeCompare(
            b.scheduled_time ??
              "99:99",
          );
        },
      );
    }, [todayTasks]);

  const sortedTomorrowTasks =
    useMemo(() => {
      return [...tomorrowTasks].sort(
        (a, b) =>
          (
            a.scheduled_time ??
            "99:99"
          ).localeCompare(
            b.scheduled_time ??
              "99:99",
          ),
      );
    }, [tomorrowTasks]);

  const sortedNextWeekTasks =
    useMemo(() => {
      return [...nextWeekTasks].sort(
        (a, b) => {
          if (
            a.scheduled_date !==
            b.scheduled_date
          ) {
            return a.scheduled_date.localeCompare(
              b.scheduled_date,
            );
          }

          return (
            a.scheduled_time ??
            "99:99"
          ).localeCompare(
            b.scheduled_time ??
              "99:99",
          );
        },
      );
    }, [nextWeekTasks]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

          <p className="mt-4 text-sm text-zinc-400">
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

  if (
    error ||
    !user ||
    !dashboard
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            !
          </div>

          <h1 className="mt-5 text-lg font-semibold text-white">
            Não foi possível carregar
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {error ||
              "Ocorreu um erro inesperado."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
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
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <DashboardSidebar
          userName={user.name}
          userEmail={user.email}
        />

        {/* MAIN */}

        <main className="min-w-0 flex-1">
          {/* MOBILE HEADER */}

          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-xs font-bold text-white">
                ST
              </div>

              <span className="font-semibold">
                Simple Task
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
            >
              Sair
            </button>
          </div>

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            {/* PAGE HEADER */}

            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium capitalize text-zinc-400">
                  {formatToday()}
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  Olá, {firstName} 👋
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Aqui está o resumo do seu dia.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/tasks/new",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Nova tarefa
              </button>
            </header>

            {/* METRICS */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total de tarefas"
                value={
                  dashboard.total
                }
                description="Tarefas programadas para hoje"
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
              />

              <MetricCard
                label="Concluídas"
                value={
                  dashboard.completed
                }
                description="Tarefas finalizadas"
                valueClassName="text-emerald-600"
                iconClassName="bg-emerald-50 text-emerald-600"
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                }
              />

              <MetricCard
                label="Pendentes"
                value={
                  dashboard.pending
                }
                description="Precisam da sua atenção"
                valueClassName="text-amber-500"
                iconClassName="bg-amber-50 text-amber-500"
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path d="M12 7v5l3 2" />
                  </svg>
                }
              />

              <MetricCard
                label="Progresso"
                value={`${completedPercentage}%`}
                description="Conclusão das tarefas de hoje"
                icon={
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-4" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-6" />
                  </svg>
                }
              />
            </section>

            {/* KANBAN */}

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Suas tarefas
                  </h2>

                  <p className="mt-1 text-xs text-zinc-400">
                    Organizadas por período e nível de urgência.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/tasks/new",
                    )
                  }
                  className="hidden rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 sm:block"
                >
                  + Nova tarefa
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4">
                {/* HOJE */}

                <TaskColumn
                  title="Tarefas de hoje"
                  subtitle={formatToday()}
                  tasks={
                    sortedTodayTasks
                  }
                  accentClassName="border-t-red-500"
                  onCreateTask={() =>
                    navigate(
                      "/tasks/new",
                    )
                  }
                  onToggleTask={
                    handleToggleTask
                  }
                  onEditTask={
                    handleEditTask
                  }
                  onDeleteTask={
                    handleDeleteTask
                  }
                />

                {/* AMANHÃ */}

                <TaskColumn
                  title="Tarefas de amanhã"
                  subtitle={`Amanhã • ${formatShortDate(
                    tomorrow,
                  )}`}
                  tasks={
                    sortedTomorrowTasks
                  }
                  accentClassName="border-t-orange-500"
                  onCreateTask={() =>
                    navigate(
                      "/tasks/new",
                    )
                  }
                  onToggleTask={
                    handleToggleTask
                  }
                  onEditTask={
                    handleEditTask
                  }
                  onDeleteTask={
                    handleDeleteTask
                  }
                />

                {/* PRÓXIMA SEMANA */}

                <TaskColumn
                  title="Tarefas da próxima semana"
                  subtitle={`${formatShortDate(
                    nextWeekStart,
                  )} — ${formatShortDate(
                    nextWeekEnd,
                  )}`}
                  tasks={
                    sortedNextWeekTasks
                  }
                  accentClassName="border-t-blue-500"
                  onCreateTask={() =>
                    navigate(
                      "/tasks/new",
                    )
                  }
                  onToggleTask={
                    handleToggleTask
                  }
                  onEditTask={
                    handleEditTask
                  }
                  onDeleteTask={
                    handleDeleteTask
                  }
                />
              </div>
            </section>

            {/* BOTTOM INFORMATION */}

            <section className="mt-4 grid gap-6 xl:grid-cols-2">
              <ProgressCard
                percentage={
                  completedPercentage
                }
                completed={
                  dashboard.completed
                }
                total={
                  dashboard.total
                }
              />

              <UrgencyCard
                baixa={
                  dashboard
                    .by_urgency
                    .baixa
                }
                media={
                  dashboard
                    .by_urgency
                    .media
                }
                alta={
                  dashboard
                    .by_urgency
                    .alta
                }
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;