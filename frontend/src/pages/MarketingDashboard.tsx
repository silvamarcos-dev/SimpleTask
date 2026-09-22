import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import { getTasks } from "../services/tasks";
import { getDepartments } from "../services/departments";
import {
  createMarketingPost,
  deleteMarketingPost,
  getMarketingPosts,
  updateMarketingPost,
} from "../services/marketingPosts";

import type { Task } from "../types/task";
import type { Department } from "../types/department";

import type {
  MarketingPost,
  MarketingPostStatus,
  MarketingPlatform,
  MarketingContentType,
  CreateMarketingPostRequest,
  UpdateMarketingPostRequest,
} from "../types/marketingPost";

/* =========================================================
   CONSTANTS
========================================================= */

type StatusCount =
  Record<MarketingPostStatus, number>;

const STATUS_LABELS: Record<
  MarketingPostStatus,
  string
> = {
  planejado: "Planejado",
  em_producao: "Em produção",
  publicado: "Publicado",
  cancelado: "Cancelado",
};

const STATUS_DOT: Record<
  MarketingPostStatus,
  string
> = {
  planejado: "bg-slate-400",
  em_producao: "bg-amber-400",
  publicado: "bg-emerald-500",
  cancelado: "bg-red-500",
};

const PLATFORM_LABELS: Record<
  MarketingPlatform,
  string
> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const CONTENT_TYPE_LABELS: Record<
  MarketingContentType,
  string
> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  carousel: "Carrossel",
};

const MONTHS_AHEAD = 2;

/* =========================================================
   HELPERS
========================================================= */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPostsRange() {
  const now = new Date();

  return {
    startDate: formatDateKey(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    ),
    endDate: formatDateKey(
      new Date(
        now.getFullYear(),
        now.getMonth() +
          MONTHS_AHEAD +
          1,
        0,
      ),
    ),
  };
}

function formatDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(
    new Date(`${date}T00:00:00`),
  );
}

function formatMonthShort(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short",
    },
  )
    .format(
      new Date(`${date}T00:00:00`),
    )
    .replace(".", "");
}

function formatTime(
  time: string | null,
): string {
  return time
    ? time.slice(0, 5)
    : "Sem horário";
}

function getTaskStatusLabel(
  status: string,
): string {
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

function getTaskStatusClass(
  status: string,
): string {
  switch (status) {
    case "em_andamento":
      return "bg-amber-50 text-amber-700";

    case "concluida":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTaskStatusIcon(
  status: string,
): string {
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
  T extends {
    scheduled_date: string;
    scheduled_time: string | null;
  },
>(
  a: T,
  b: T,
): number {
  const keyA = `${a.scheduled_date} ${
    a.scheduled_time ?? "99:99"
  }`;

  const keyB = `${b.scheduled_date} ${
    b.scheduled_time ?? "99:99"
  }`;

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
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-slate-100"
          />
        ),
      )}
    </div>
  );
}

/* =========================================================
   POST MODAL
========================================================= */

interface MarketingPostModalProps {
  post: MarketingPost | null;
  onClose: () => void;
  onSaved: (
    post: MarketingPost,
  ) => void;
}

function MarketingPostModal({
  post,
  onClose,
  onSaved,
}: MarketingPostModalProps) {
  const isEditing = post !== null;

  const [title, setTitle] =
    useState(
      post?.title ?? "",
    );

  const [description, setDescription] =
    useState(
      post?.description ?? "",
    );

  const [scheduledDate, setScheduledDate] =
    useState(
      post?.scheduled_date ?? "",
    );

  const [scheduledTime, setScheduledTime] =
    useState(
      post?.scheduled_time?.slice(
        0,
        5,
      ) ?? "",
    );

  const [platform, setPlatform] =
    useState<MarketingPlatform>(
      post?.platform ??
        "instagram",
    );

  const [contentType, setContentType] =
    useState<MarketingContentType>(
      post?.content_type ??
        "feed",
    );

  const [status, setStatus] =
    useState<MarketingPostStatus>(
      post?.status ??
        "planejado",
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [onClose]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Informe o título da postagem.",
      );
      return;
    }

    if (!scheduledDate) {
      setError(
        "Informe a data da postagem.",
      );
      return;
    }

    setLoading(true);

    try {
      if (isEditing && post) {
        const data: UpdateMarketingPostRequest =
          {
            title: title.trim(),
            description:
              description.trim() ||
              null,
            scheduled_date:
              scheduledDate,
            scheduled_time:
              scheduledTime ||
              null,
            platform,
            content_type:
              contentType,
            status,
          };

        const updated =
          await updateMarketingPost(
            post.id,
            data,
          );

        onSaved(updated);
      } else {
        const data: CreateMarketingPostRequest =
          {
            title: title.trim(),
            description:
              description.trim() ||
              null,
            scheduled_date:
              scheduledDate,
            scheduled_time:
              scheduledTime ||
              null,
            platform,
            content_type:
              contentType,
            status,
          };

        const created =
          await createMarketingPost(
            data,
          );

        onSaved(created);
      }

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        isEditing
          ? "Não foi possível atualizar a postagem."
          : "Não foi possível criar a postagem.",
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
      />

      {/* MODAL */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketing-post-modal-title"
        className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-h-[90vh] sm:rounded-[24px]"
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h2
              id="marketing-post-modal-title"
              className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
            >
              {isEditing
                ? "Editar postagem"
                : "Nova postagem"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Atualize as informações do conteúdo."
                : "Planeje uma nova publicação de marketing."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* TÍTULO */}

            <div>
              <label
                htmlFor="marketing-title"
                className={labelClass}
              >
                Título
              </label>

              <input
                id="marketing-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Post institucional da Meta"
                maxLength={200}
                required
                disabled={loading}
                className={fieldClass}
              />
            </div>

            {/* DESCRIÇÃO */}

            <div>
              <label
                htmlFor="marketing-description"
                className={labelClass}
              >
                Descrição
              </label>

              <textarea
                id="marketing-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Descreva o conteúdo, briefing ou observações..."
                rows={4}
                maxLength={5000}
                disabled={loading}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {/* DATA + HORÁRIO */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="marketing-date"
                  className={labelClass}
                >
                  Data
                </label>

                <input
                  id="marketing-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(event) =>
                    setScheduledDate(
                      event.target.value,
                    )
                  }
                  required
                  disabled={loading}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="marketing-time"
                  className={labelClass}
                >
                  Horário
                </label>

                <input
                  id="marketing-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(event) =>
                    setScheduledTime(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* PLATAFORMA */}

            <div>
              <label
                htmlFor="marketing-platform"
                className={labelClass}
              >
                Plataforma
              </label>

              <select
                id="marketing-platform"
                value={platform}
                onChange={(event) =>
                  setPlatform(
                    event.target
                      .value as MarketingPlatform,
                  )
                }
                disabled={loading}
                className={fieldClass}
              >
                {(
                  Object.keys(
                    PLATFORM_LABELS,
                  ) as MarketingPlatform[]
                ).map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {
                        PLATFORM_LABELS[
                          option
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* TIPO + STATUS */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="marketing-content-type"
                  className={labelClass}
                >
                  Tipo de conteúdo
                </label>

                <select
                  id="marketing-content-type"
                  value={contentType}
                  onChange={(event) =>
                    setContentType(
                      event.target
                        .value as MarketingContentType,
                    )
                  }
                  disabled={loading}
                  className={fieldClass}
                >
                  {(
                    Object.keys(
                      CONTENT_TYPE_LABELS,
                    ) as MarketingContentType[]
                  ).map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {
                          CONTENT_TYPE_LABELS[
                            option
                          ]
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="marketing-status"
                  className={labelClass}
                >
                  Status
                </label>

                <select
                  id="marketing-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as MarketingPostStatus,
                    )
                  }
                  disabled={loading}
                  className={fieldClass}
                >
                  {(
                    Object.keys(
                      STATUS_LABELS,
                    ) as MarketingPostStatus[]
                  ).map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {
                          STATUS_LABELS[
                            option
                          ]
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="marketing-post-form"
            onClick={() => {
              const form =
                document.querySelector(
                  "form[data-marketing-post-form='true']",
                ) as HTMLFormElement | null;

              form?.requestSubmit();
            }}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar postagem"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MarketingDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [posts, setPosts] =
    useState<MarketingPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     MODAL
  ===================================================== */

  const [modalPost, setModalPost] =
    useState<MarketingPost | null>(
      null,
    );

  const [modalOpen, setModalOpen] =
    useState(false);

  const [deletingPostId, setDeletingPostId] =
    useState<number | null>(null);

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadDashboard() {
    setError("");

    try {
      const {
        startDate,
        endDate,
      } = getPostsRange();

      const [
        tasksData,
        departmentsData,
        postsData,
      ] = await Promise.all([
        getTasks(),
        getDepartments(),
        getMarketingPosts(
          startDate,
          endDate,
        ),
      ]);

      setTasks(tasksData);
      setDepartments(
        departmentsData,
      );
      setPosts(postsData);
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível carregar o dashboard de marketing.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const {
      startDate,
      endDate,
    } = getPostsRange();

    Promise.all([
      getTasks(),
      getDepartments(),
      getMarketingPosts(
        startDate,
        endDate,
      ),
    ])
      .then(
        ([
          tasksData,
          departmentsData,
          postsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setTasks(tasksData);
          setDepartments(
            departmentsData,
          );
          setPosts(postsData);
        },
      )
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setError(
            "Não foi possível carregar o dashboard de marketing.",
          );
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
     MODAL ACTIONS
  ======================================================= */

  function openCreateModal() {
    setModalPost(null);
    setModalOpen(true);
  }

  function openEditModal(
    post: MarketingPost,
  ) {
    setModalPost(post);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalPost(null);
  }

  function handlePostSaved(
    savedPost: MarketingPost,
  ) {
    setPosts((current) => {
      const exists = current.some(
        (post) =>
          post.id === savedPost.id,
      );

      if (exists) {
        return current.map(
          (post) =>
            post.id ===
            savedPost.id
              ? savedPost
              : post,
        );
      }

      return [
        ...current,
        savedPost,
      ].sort(sortBySchedule);
    });
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDeletePost(
    post: MarketingPost,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir a postagem "${post.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingPostId(post.id);

    try {
      await deleteMarketingPost(
        post.id,
      );

      setPosts((current) =>
        current.filter(
          (item) =>
            item.id !== post.id,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível excluir a postagem.",
      );
    } finally {
      setDeletingPostId(null);
    }
  }

  /* =======================================================
     DEPARTAMENTO MARKETING
  ======================================================= */

  const marketingDepartment =
    useMemo(
      () =>
        departments.find(
          (department) =>
            department.name
              .trim()
              .toLowerCase() ===
            "marketing",
        ),
      [departments],
    );

  /* =======================================================
     TAREFAS
  ======================================================= */

  const marketingTasks =
    useMemo(() => {
      if (!marketingDepartment) {
        return [];
      }

      return tasks
        .filter(
          (task) =>
            task.department_id ===
            marketingDepartment.id,
        )
        .sort(sortBySchedule);
    }, [
      tasks,
      marketingDepartment,
    ]);

  const taskMetrics =
    useMemo(() => {
      const byStatus = (
        status: string,
      ) =>
        marketingTasks.filter(
          (task) =>
            (task.status as string) ===
            status,
        ).length;

      return {
        total:
          marketingTasks.length,

        pending:
          byStatus("pendente"),

        completed:
          byStatus("concluida"),
      };
    }, [marketingTasks]);

  const recentTasks =
    useMemo(
      () =>
        marketingTasks.slice(
          0,
          6,
        ),
      [marketingTasks],
    );

  /* =======================================================
     POSTAGENS
  ======================================================= */

  const postMetrics =
    useMemo<StatusCount>(() => {
      const counts: StatusCount =
        {
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

  const todayKey =
    formatDateKey(
      new Date(),
    );

  const upcomingPosts =
    useMemo(
      () =>
        posts
          .filter(
            (post) =>
              post.scheduled_date >=
                todayKey &&
              post.status !==
                "cancelado",
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
            {/* HEADER */}

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
                onClick={
                  openCreateModal
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-[15px] font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                <span className="text-lg font-light leading-none">
                  +
                </span>

                Nova postagem
              </button>
            </header>

            {/* ERROR */}

            {error && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadDashboard
                  }
                  className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* METRICS */}

            <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div
                className={`${cardClass} p-5`}
              >
                <p className="text-sm font-medium text-slate-500">
                  Tarefas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading
                    ? "–"
                    : taskMetrics.total}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  do departamento
                </p>
              </div>

              <div
                className={`${cardClass} p-5`}
              >
                <p className="text-sm font-medium text-slate-500">
                  Pendentes
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading
                    ? "–"
                    : taskMetrics.pending}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  aguardando execução
                </p>
              </div>

              <div
                className={`${cardClass} p-5`}
              >
                <p className="text-sm font-medium text-slate-500">
                  Tarefas concluídas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading
                    ? "–"
                    : taskMetrics.completed}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  finalizadas
                </p>
              </div>

              <div
                className={`${cardClass} p-5`}
              >
                <p className="text-sm font-medium text-slate-500">
                  Postagens programadas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading
                    ? "–"
                    : upcomingPosts.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  a partir de hoje
                </p>
              </div>
            </section>

            {/* CONTENT GRID */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              {/* TAREFAS */}

              <div
                className={`overflow-hidden ${cardClass}`}
              >
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
                    onClick={() =>
                      navigate(
                        "/tasks",
                      )
                    }
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
                ) : recentTasks.length ===
                  0 ? (
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
                    {recentTasks.map(
                      (task) => {
                        const status =
                          task.status as string;

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
                            className="flex w-full items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-3 text-left transition duration-200 hover:bg-slate-100/80 sm:px-4"
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${getTaskStatusClass(
                                status,
                              )}`}
                            >
                              {getTaskStatusIcon(
                                status,
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-[15px] font-medium ${
                                  status ===
                                  "concluida"
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900"
                                }`}
                              >
                                {
                                  task.title
                                }
                              </span>

                              <span className="mt-0.5 block text-xs text-slate-400">
                                {formatDate(
                                  task.scheduled_date,
                                )}

                                {task.scheduled_time &&
                                  ` · ${formatTime(
                                    task.scheduled_time,
                                  )}`}
                              </span>
                            </span>

                            <span
                              className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${getTaskStatusClass(
                                status,
                              )}`}
                            >
                              {getTaskStatusLabel(
                                status,
                              )}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* PRÓXIMAS POSTAGENS */}

              <div
                className={`overflow-hidden ${cardClass}`}
              >
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
                    onClick={() =>
                      navigate(
                        "/marketing/calendar",
                      )
                    }
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
                ) : upcomingPosts.length ===
                  0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Nenhuma postagem programada
                    </p>

                    <button
                      type="button"
                      onClick={
                        openCreateModal
                      }
                      className="mt-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Criar primeira postagem
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 sm:p-4">
                    {upcomingPosts.map(
                      (post) => (
                        <div
                          key={
                            post.id
                          }
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition duration-200 hover:bg-slate-50 sm:px-4"
                        >
                          {/* DATA */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                post,
                              )
                            }
                            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eaf0fb]"
                            title="Editar postagem"
                          >
                            <span className="text-[10px] font-medium uppercase leading-none text-slate-400">
                              {formatMonthShort(
                                post.scheduled_date,
                              )}
                            </span>

                            <span className="mt-0.5 text-sm font-semibold leading-none text-slate-800">
                              {post.scheduled_date.slice(
                                8,
                                10,
                              )}
                            </span>
                          </button>

                          {/* INFORMAÇÕES */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                post,
                              )
                            }
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="block truncate text-sm font-medium text-slate-900">
                              {
                                post.title
                              }
                            </span>

                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {
                                PLATFORM_LABELS[
                                  post.platform
                                ]
                              }{" "}
                              ·{" "}
                              {
                                CONTENT_TYPE_LABELS[
                                  post.content_type
                                ]
                              }{" "}
                              ·{" "}
                              {formatTime(
                                post.scheduled_time,
                              )}
                            </span>
                          </button>

                          {/* AÇÕES */}

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  post,
                                )
                              }
                              title="Editar postagem"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePost(
                                  post,
                                )
                              }
                              disabled={
                                deletingPostId ===
                                post.id
                              }
                              title="Excluir postagem"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingPostId ===
                              post.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="m19 6-1 14H6L5 6" />
                                  <path d="M10 11v5M14 11v5" />
                                </svg>
                              )}
                            </button>

                            {post.scheduled_date ===
                            todayKey ? (
                              <span className="ml-1 hidden shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 sm:inline-flex">
                                Hoje
                              </span>
                            ) : (
                              <span
                                className={`ml-1 hidden h-2 w-2 shrink-0 rounded-full sm:block ${STATUS_DOT[post.status]}`}
                                title={
                                  STATUS_LABELS[
                                    post.status
                                  ]
                                }
                              />
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* STATUS */}

            <section
              className={`mt-5 p-5 sm:p-6 ${cardClass}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    Status das postagens
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Mês atual e os próximos{" "}
                    {MONTHS_AHEAD}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(
                  Object.keys(
                    STATUS_LABELS,
                  ) as MarketingPostStatus[]
                ).map(
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
                          {
                            STATUS_LABELS[
                              status
                            ]
                          }
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                        {loading
                          ? "–"
                          : postMetrics[
                              status
                            ]}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (
        <MarketingPostModal
          post={modalPost}
          onClose={closeModal}
          onSaved={
            handlePostSaved
          }
        />
      )}
    </div>
  );
}

export default MarketingDashboard;