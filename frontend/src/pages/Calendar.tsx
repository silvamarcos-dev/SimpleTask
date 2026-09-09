import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { getCalendarTasks } from "../services/calendar";
import { getCurrentUser } from "../services/user";

import type { Task } from "../types/task";
import type { UserResponse } from "../types/auth";

/* =========================================================
   DATE HELPERS
========================================================= */

function getLocalDateString(
  date: Date,
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

function getMonthStart(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function getMonthEnd(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  );
}

/*
 * Primeiro dia visual da grade.
 * O calendário começa na segunda-feira.
 */
function getCalendarStart(
  date: Date,
): Date {
  const monthStart =
    getMonthStart(date);

  const day =
    monthStart.getDay();

  const daysFromMonday =
    day === 0
      ? 6
      : day - 1;

  const start = new Date(
    monthStart,
  );

  start.setDate(
    start.getDate() -
      daysFromMonday,
  );

  return start;
}

/*
 * Último dia visual da grade.
 * O calendário termina no domingo.
 */
function getCalendarEnd(
  date: Date,
): Date {
  const monthEnd =
    getMonthEnd(date);

  const day =
    monthEnd.getDay();

  const daysUntilSunday =
    day === 0
      ? 0
      : 7 - day;

  const end = new Date(
    monthEnd,
  );

  end.setDate(
    end.getDate() +
      daysUntilSunday,
  );

  return end;
}

function addMonths(
  date: Date,
  months: number,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + months,
    1,
  );
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatMonthYear(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatTaskTime(
  time: string | null | undefined,
): string {
  if (!time) {
    return "";
  }

  return String(time).slice(
    0,
    5,
  );
}

/* =========================================================
   CALENDAR
========================================================= */

function Calendar() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<UserResponse | null>(
      null,
    );

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [currentMonth, setCurrentMonth] =
    useState(
      getMonthStart(new Date()),
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD CALENDAR
  ======================================================= */

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      setError("");

      try {
        /*
         * IMPORTANTE:
         *
         * Aqui buscamos somente o mês selecionado.
         *
         * Exemplo:
         * Setembro/2026
         *
         * start_date = 2026-09-01
         * end_date   = 2026-09-30
         *
         * Os dias de agosto/outubro aparecem na grade,
         * mas não buscamos tarefas deles.
         */

        const monthStart =
          getMonthStart(
            currentMonth,
          );

        const monthEnd =
          getMonthEnd(
            currentMonth,
          );

        const [
          currentUser,
          calendarData,
        ] = await Promise.all([
          getCurrentUser(),

          getCalendarTasks(
            getLocalDateString(
              monthStart,
            ),
            getLocalDateString(
              monthEnd,
            ),
          ),
        ]);

        /*
         * A API retorna:
         *
         * {
         *   start_date: "...",
         *   end_date: "...",
         *   days: [
         *     {
         *       date: "...",
         *       tasks: [...]
         *     }
         *   ]
         * }
         *
         * Portanto precisamos extrair
         * os tasks de cada dia.
         */

        const allTasks =
          calendarData.days.flatMap(
            (day) => day.tasks,
          );

        setUser(currentUser);
        setTasks(allTasks);
      } catch {
        setError(
          "Não foi possível carregar o calendário.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, [currentMonth]);

  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const calendarDays = useMemo(() => {
    const start =
      getCalendarStart(
        currentMonth,
      );

    const end =
      getCalendarEnd(
        currentMonth,
      );

    const days: Date[] = [];

    const current = new Date(
      start,
    );

    while (
      current <= end
    ) {
      days.push(
        new Date(current),
      );

      current.setDate(
        current.getDate() + 1,
      );
    }

    return days;
  }, [currentMonth]);

  /* =======================================================
     TASKS BY DATE
  ======================================================= */

  const tasksByDate =
    useMemo(() => {
      const grouped: Record<
        string,
        Task[]
      > = {};

      for (const task of tasks) {
        if (
          !task ||
          !task.scheduled_date
        ) {
          continue;
        }

        if (
          !grouped[
            task.scheduled_date
          ]
        ) {
          grouped[
            task.scheduled_date
          ] = [];
        }

        grouped[
          task.scheduled_date
        ].push(task);
      }

      /*
       * Ordenação:
       *
       * 1. Tarefas com horário primeiro
       * 2. Horário crescente
       * 3. Sem horário ficam depois
       * 4. Título como critério final
       */

      for (const date of Object.keys(
        grouped,
      )) {
        grouped[date].sort(
          (a, b) => {
            const timeA =
              a?.scheduled_time
                ? String(
                    a.scheduled_time,
                  )
                : "";

            const timeB =
              b?.scheduled_time
                ? String(
                    b.scheduled_time,
                  )
                : "";

            if (
              timeA &&
              timeB
            ) {
              return timeA.localeCompare(
                timeB,
              );
            }

            if (timeA) {
              return -1;
            }

            if (timeB) {
              return 1;
            }

            const titleA =
              a?.title
                ? String(a.title)
                : "";

            const titleB =
              b?.title
                ? String(b.title)
                : "";

            return titleA.localeCompare(
              titleB,
            );
          },
        );
      }

      return grouped;
    }, [tasks]);

  /* =======================================================
     TODAY
  ======================================================= */

  const todayString =
    getLocalDateString(
      new Date(),
    );

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  function handlePreviousMonth() {
    setCurrentMonth(
      addMonths(
        currentMonth,
        -1,
      ),
    );
  }

  function handleNextMonth() {
    setCurrentMonth(
      addMonths(
        currentMonth,
        1,
      ),
    );
  }

  function handleToday() {
    setCurrentMonth(
      getMonthStart(
        new Date(),
      ),
    );
  }

  /* =======================================================
     TASK STYLE
  ======================================================= */

  function getUrgencyClass(
    task: Task,
  ): string {
    if (
      task.urgency === "alta"
    ) {
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
    }

    if (
      task.urgency === "media"
    ) {
      return "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100";
    }

    return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
  }

  function getUrgencyDotClass(
    task: Task,
  ): string {
    if (
      task.urgency === "alta"
    ) {
      return "bg-red-500";
    }

    if (
      task.urgency === "media"
    ) {
      return "bg-orange-500";
    }

    return "bg-blue-500";
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

          <p className="mt-4 text-sm text-zinc-400">
            Carregando calendário...
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
    !user
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

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <DashboardSidebar
          userName={user.name}
          userEmail={user.email}
        />

        {/* =================================================
            MAIN
        ================================================= */}

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
                navigate(
                  "/dashboard",
                )
              }
              className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100"
            >
              Voltar
            </button>
          </div>

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium capitalize text-zinc-400">
                  Planejamento
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  Calendário
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Visualize todas as suas tarefas do mês.
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

            {/* =================================================
                CALENDAR CARD
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

              {/* =================================================
                  CALENDAR HEADER
              ================================================= */}

              <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-semibold capitalize text-zinc-950">
                    {formatMonthYear(
                      currentMonth,
                    )}
                  </h2>

                  <p className="mt-1 text-xs text-zinc-400">
                    {tasks.length}{" "}
                    {tasks.length === 1
                      ? "tarefa"
                      : "tarefas"}{" "}
                    no mês
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handleToday
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    Hoje
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePreviousMonth
                    }
                    aria-label="Mês anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextMonth
                    }
                    aria-label="Próximo mês"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>

                </div>
              </div>

              {/* =================================================
                  LEGEND
              ================================================= */}

              <div className="flex flex-wrap items-center gap-4 border-b border-zinc-200 px-5 py-3">

                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Urgência
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-xs text-zinc-500">
                    Alta
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-xs text-zinc-500">
                    Média
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />

                  <span className="text-xs text-zinc-500">
                    Baixa
                  </span>
                </div>

              </div>

              {/* =================================================
                  WEEK DAYS
              ================================================= */}

              <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">

                {[
                  "Seg",
                  "Ter",
                  "Qua",
                  "Qui",
                  "Sex",
                  "Sáb",
                  "Dom",
                ].map(
                  (day) => (
                    <div
                      key={day}
                      className="border-r border-zinc-200 px-2 py-3 text-center last:border-r-0"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:text-xs">
                        {day}
                      </span>
                    </div>
                  ),
                )}

              </div>

              {/* =================================================
                  DAYS
              ================================================= */}

              <div className="grid grid-cols-7">

                {calendarDays.map(
                  (day) => {
                    const dateString =
                      getLocalDateString(
                        day,
                      );

                    const dayTasks =
                      tasksByDate[
                        dateString
                      ] ?? [];

                    const isCurrentMonth =
                      day.getMonth() ===
                        currentMonth.getMonth() &&
                      day.getFullYear() ===
                        currentMonth.getFullYear();

                    const isToday =
                      dateString ===
                      todayString;

                    return (
                      <div
                        key={dateString}
                        className={`group relative min-h-[130px] border-b border-r border-zinc-200 p-2 transition sm:min-h-[160px] sm:p-3 ${
                          !isCurrentMonth
                            ? "bg-zinc-50/70"
                            : "bg-white"
                        }`}
                      >

                        {/* DAY NUMBER */}

                        <div className="mb-2 flex items-center justify-between">

                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${
                              isToday
                                ? "bg-zinc-950 text-white"
                                : isCurrentMonth
                                  ? "text-zinc-700"
                                  : "text-zinc-300"
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          {dayTasks.length >
                            0 && (
                            <span className="text-[9px] font-medium text-zinc-300">
                              {dayTasks.length}
                            </span>
                          )}

                        </div>

                        {/* TASKS */}

                        <div className="space-y-1.5">

                          {dayTasks
                            .slice(0, 4)
                            .map(
                              (task) => {
                                const completed =
                                  task.status ===
                                  "concluida";

                                return (
                                  <button
                                    key={
                                      task.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/tasks/${task.id}/edit`,
                                      )
                                    }
                                    className={`block w-full rounded-lg border px-2 py-1.5 text-left transition ${getUrgencyClass(
                                      task,
                                    )} ${
                                      completed
                                        ? "opacity-50"
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
                                        className={`min-w-0 truncate text-[10px] font-semibold ${
                                          completed
                                            ? "line-through"
                                            : ""
                                        }`}
                                      >
                                        {task.title ||
                                          "Tarefa sem título"}
                                      </span>

                                    </div>

                                    {task.scheduled_time && (
                                      <span className="mt-0.5 block pl-3 text-[9px] opacity-70">
                                        {formatTaskTime(
                                          task.scheduled_time,
                                        )}
                                      </span>
                                    )}

                                  </button>
                                );
                              },
                            )}

                          {/* MORE TASKS */}

                          {dayTasks.length >
                            4 && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/tasks/new?date=${dateString}`,
                                )
                              }
                              className="w-full rounded-lg px-2 py-1 text-left text-[9px] font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                            >
                              +{" "}
                              {dayTasks.length -
                                4}{" "}
                              mais
                            </button>
                          )}

                        </div>

                        {/* CREATE TASK */}

                        {dayTasks.length ===
                          0 &&
                          isCurrentMonth && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/tasks/new?date=${dateString}`,
                                )
                              }
                              className="absolute bottom-2 right-2 hidden rounded-md px-2 py-1 text-[9px] font-semibold text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-600 group-hover:block"
                            >
                              + tarefa
                            </button>
                          )}

                      </div>
                    );
                  },
                )}

              </div>

            </section>

            {/* =================================================
                FOOTER SUMMARY
            ================================================= */}

            <section className="mt-5 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-zinc-400">
                  Total no mês
                </p>

                <p className="mt-2 text-2xl font-bold text-zinc-950">
                  {tasks.length}
                </p>

                <p className="mt-1 text-[11px] text-zinc-400">
                  tarefas programadas
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-zinc-400">
                  Pendentes
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-500">
                  {
                    tasks.filter(
                      (task) =>
                        task.status !==
                        "concluida",
                    ).length
                  }
                </p>

                <p className="mt-1 text-[11px] text-zinc-400">
                  precisam de atenção
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-zinc-400">
                  Concluídas
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {
                    tasks.filter(
                      (task) =>
                        task.status ===
                        "concluida",
                    ).length
                  }
                </p>

                <p className="mt-1 text-[11px] text-zinc-400">
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