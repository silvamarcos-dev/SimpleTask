import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import { getTasks } from "../services/tasks";
import { getDepartments } from "../services/departments";
import { getMarketingPosts } from "../services/marketingPosts";

import type { Task } from "../types/task";
import type { Department } from "../types/department";
import type {
  MarketingPost,
  MarketingPostStatus,
} from "../types/marketingPost";

/* =========================================================
   CONSTANTS
========================================================= */

type StatusCount = Record<MarketingPostStatus, number>;

const STATUS_LABELS: Record<MarketingPostStatus, string> = {
  planejado: "Planejado",
  em_producao: "Em produção",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

const STATUS_DOT: Record<MarketingPostStatus, string> = {
  planejado: "bg-slate-400",
  em_producao: "bg-amber-400",
  publicado: "bg-emerald-500",
  cancelado: "bg-red-500",
};

const PLATFORM_LABELS: Record<MarketingPost["platform"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const CONTENT_TYPE_LABELS: Record<MarketingPost["content_type"], string> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  carousel: "Carrossel",
};

/*
 * Janela de postagens considerada pelo dashboard:
 * do início do mês atual até o fim do segundo mês seguinte.
 */
const MONTHS_AHEAD = 2;

/* =========================================================
   HELPERS
========================================================= */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPostsRange() {
  const now = new Date();

  return {
    startDate: formatDateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDateKey(
      new Date(now.getFullYear(), now.getMonth() + MONTHS_AHEAD + 1, 0),
    ),
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatMonthShort(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(`${date}T00:00:00`))
    .replace(".", "");
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : "Sem horário";
}

/*
 * Recebem string (e não Task["status"]) para funcionar com qualquer
 * conjunto de status que o backend devolva, incluindo "em_andamento".
 */

function getTaskStatusLabel(status: string): string {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "em_andamento":
      return "Em andamento";
    case "concluida":
      return "Concluída";
    default:
      return status;
  }
}

function getTaskStatusClass(status: string): string {
  switch (status) {
    case "em_andamento":
      return "bg-amber-50 text-amber-700";
    case "concluida":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTaskStatusIcon(status: string): string {
  switch (status) {
    case "concluida":
      return "✓";
    case "em_andamento":
      return "•";
    default:
      return "○";
  }
}

function sortBySchedule<
  T extends { scheduled_date: string; scheduled_time: string | null },
>(a: T, b: T): number {
  const keyA = `${a.scheduled_date} ${a.scheduled_time ?? "99:99"}`;
  const keyB = `${b.scheduled_date} ${b.scheduled_time ?? "99:99"}`;

  return keyA.localeCompare(keyB);
}

const cardClass =
  "rounded-2xl border border-white/70 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm";

/* =========================================================
   SKELETON
========================================================= */

function ListSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MarketingDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [posts, setPosts] = useState<MarketingPost[]>([]);

  /*
   * loading já nasce true e error já nasce vazio: o efeito roda uma vez
   * só, então não há motivo para "resetar" os dois no começo dele.
   * Todos os setState abaixo acontecem depois do await.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const { startDate, endDate } = getPostsRange();

    Promise.all([getTasks(), getDepartments(), getMarketingPosts(startDate, endDate)])
      .then(([tasksData, departmentsData, postsData]) => {
        if (cancelled) {
          return;
        }

        setTasks(tasksData);
        setDepartments(departmentsData);
        setPosts(postsData);
      })
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setError("Não foi possível carregar o dashboard de marketing.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     DEPARTAMENTO MARKETING (encontrado pelo nome)
  ======================================================= */

  const marketingDepartment = useMemo(
    () =>
      departments.find(
        (department) => department.name.trim().toLowerCase() === "marketing",
      ),
    [departments],
  );

  /* =======================================================
     TAREFAS DE MARKETING
  ======================================================= */

  const marketingTasks = useMemo(() => {
    if (!marketingDepartment) {
      return [];
    }

    return tasks
      .filter((task) => task.department_id === marketingDepartment.id)
      .sort(sortBySchedule);
  }, [tasks, marketingDepartment]);

  const taskMetrics = useMemo(() => {
    const byStatus = (status: string) =>
      marketingTasks.filter((task) => (task.status as string) === status)
        .length;

    return {
      total: marketingTasks.length,
      pending: byStatus("pendente"),
      completed: byStatus("concluida"),
    };
  }, [marketingTasks]);

  const recentTasks = useMemo(
    () => marketingTasks.slice(0, 6),
    [marketingTasks],
  );

  /* =======================================================
     POSTAGENS
  ======================================================= */

  const postMetrics = useMemo<StatusCount>(() => {
    const counts: StatusCount = {
      planejado: 0,
      em_producao: 0,
      publicado: 0,
      cancelado: 0,
    };

    for (const post of posts) {
      counts[post.status] += 1;
    }

    return counts;
  }, [posts]);

  const todayKey = formatDateKey(new Date());

  const upcomingPosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.scheduled_date >= todayKey && post.status !== "cancelado",
        )
        .sort(sortBySchedule)
        .slice(0, 6),
    [posts, todayKey],
  );

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

            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.035em] text-slate-900 sm:text-[2.3rem]">
                  Marketing
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  Tarefas do departamento e planejamento de conteúdo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/marketing/calendar")}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-[15px] font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                <span className="text-lg font-light leading-none">+</span>
                Nova postagem
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
                  onClick={() => window.location.reload()}
                  className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* =============================================
                METRICS
            ============================================= */}

            <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">Tarefas</p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.total}
                </p>

                <p className="mt-2 text-xs text-slate-400">do departamento</p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">Pendentes</p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.pending}
                </p>

                <p className="mt-2 text-xs text-slate-400">aguardando execução</p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Tarefas concluídas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.completed}
                </p>

                <p className="mt-2 text-xs text-slate-400">finalizadas</p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Postagens programadas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : upcomingPosts.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">a partir de hoje</p>
              </div>
            </section>

            {/* =============================================
                CONTENT GRID
            ============================================= */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              {/* TAREFAS */}

              <div className={`overflow-hidden ${cardClass}`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                      Tarefas de marketing
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Próximas atividades do departamento
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/tasks")}
                    className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Ver todas
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>

                {loading ? (
                  <ListSkeleton />
                ) : !marketingDepartment ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Departamento Marketing não encontrado
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Cadastre um departamento com o nome "Marketing".
                    </p>
                  </div>
                ) : recentTasks.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Nenhuma tarefa de marketing
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      As tarefas do departamento aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 sm:p-4">
                    {recentTasks.map((task) => {
                      const status = task.status as string;

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                          className="flex w-full items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-3 text-left transition duration-200 hover:bg-slate-100/80 sm:px-4"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${getTaskStatusClass(
                              status,
                            )}`}
                          >
                            {getTaskStatusIcon(status)}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[15px] font-medium ${
                                status === "concluida"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </span>

                            <span className="mt-0.5 block text-xs text-slate-400">
                              {formatDate(task.scheduled_date)}
                              {task.scheduled_time &&
                                ` · ${formatTime(task.scheduled_time)}`}
                            </span>
                          </span>

                          <span
                            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${getTaskStatusClass(
                              status,
                            )}`}
                          >
                            {getTaskStatusLabel(status)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PRÓXIMAS POSTAGENS */}

              <div className={`overflow-hidden ${cardClass}`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                      Próximas postagens
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Conteúdo programado
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/marketing/calendar")}
                    className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Calendário
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>

                {loading ? (
                  <ListSkeleton />
                ) : upcomingPosts.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Nenhuma postagem programada
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/marketing/calendar")}
                      className="mt-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Planejar no calendário
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 sm:p-4">
                    {upcomingPosts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => navigate("/marketing/calendar")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition duration-200 hover:bg-slate-50 sm:px-4"
                      >
                        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eaf0fb]">
                          <span className="text-[10px] font-medium uppercase leading-none text-slate-400">
                            {formatMonthShort(post.scheduled_date)}
                          </span>

                          <span className="mt-0.5 text-sm font-semibold leading-none text-slate-800">
                            {post.scheduled_date.slice(8, 10)}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {post.title}
                          </span>

                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {PLATFORM_LABELS[post.platform]} ·{" "}
                            {CONTENT_TYPE_LABELS[post.content_type]} ·{" "}
                            {formatTime(post.scheduled_time)}
                          </span>
                        </span>

                        {post.scheduled_date === todayKey ? (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                            Hoje
                          </span>
                        ) : (
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                            title={STATUS_LABELS[post.status]}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                STATUS DAS POSTAGENS
            ============================================= */}

            <section className={`mt-5 p-5 sm:p-6 ${cardClass}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    Status das postagens
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Mês atual e os próximos {MONTHS_AHEAD}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(Object.keys(STATUS_LABELS) as MarketingPostStatus[]).map(
                  (status) => (
                    <div
                      key={status}
                      className="rounded-xl bg-slate-50/80 px-4 py-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
                        />

                        <span className="text-sm font-medium text-slate-500">
                          {STATUS_LABELS[status]}
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                        {loading ? "–" : postMetrics[status]}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MarketingDashboard;