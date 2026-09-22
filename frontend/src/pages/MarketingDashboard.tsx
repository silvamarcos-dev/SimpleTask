/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
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
  CreateMarketingPostRequest,
  MarketingContentType,
  MarketingPlatform,
  MarketingPost,
  MarketingPostStatus,
  UpdateMarketingPostRequest,
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

const PLATFORM_LABELS: Record<MarketingPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const CONTENT_TYPE_LABELS: Record<MarketingContentType, string> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  carousel: "Carrossel",
};

const PLATFORM_OPTIONS: {
  value: MarketingPlatform;
  label: string;
}[] = [
  {
    value: "instagram",
    label: "Instagram",
  },
  {
    value: "facebook",
    label: "Facebook",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
  },
  {
    value: "tiktok",
    label: "TikTok",
  },
];

const CONTENT_TYPE_OPTIONS: {
  value: MarketingContentType;
  label: string;
}[] = [
  {
    value: "feed",
    label: "Feed",
  },
  {
    value: "story",
    label: "Story",
  },
  {
    value: "reels",
    label: "Reels",
  },
  {
    value: "carousel",
    label: "Carrossel",
  },
];

const STATUS_OPTIONS: {
  value: MarketingPostStatus;
  label: string;
}[] = [
  {
    value: "planejado",
    label: "Planejado",
  },
  {
    value: "em_producao",
    label: "Em produção",
  },
  {
    value: "publicado",
    label: "Publicado",
  },
  {
    value: "cancelado",
    label: "Cancelado",
  },
];

const MONTHS_AHEAD = 2;

const cardClass =
  "rounded-2xl border border-white/70 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm";

/* =========================================================
   HELPERS
========================================================= */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayKey(): string {
  return formatDateKey(new Date());
}

function getPostsRange() {
  const now = new Date();

  return {
    startDate: formatDateKey(
      new Date(now.getFullYear(), now.getMonth(), 1),
    ),
    endDate: formatDateKey(
      new Date(
        now.getFullYear(),
        now.getMonth() + MONTHS_AHEAD + 1,
        0,
      ),
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
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  })
    .format(new Date(`${date}T00:00:00`))
    .replace(".", "");
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : "Sem horário";
}

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
  T extends {
    scheduled_date: string;
    scheduled_time: string | null;
  },
>(a: T, b: T): number {
  const keyA = `${a.scheduled_date} ${a.scheduled_time ?? "99:99"}`;
  const keyB = `${b.scheduled_date} ${b.scheduled_time ?? "99:99"}`;

  return keyA.localeCompare(keyB);
}

/* =========================================================
   SKELETON
========================================================= */

function ListSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-16 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

/* =========================================================
   MARKETING POST MODAL
========================================================= */

type MarketingPostModalProps = {
  post: MarketingPost | null;
  onClose: () => void;
  onSaved: (post: MarketingPost) => void;
};

function MarketingPostModal({
  post,
  onClose,
  onSaved,
}: MarketingPostModalProps) {
  const isEditing = post !== null;

  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(
    post?.description ?? "",
  );
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduled_date ?? getTodayKey(),
  );
  const [scheduledTime, setScheduledTime] = useState(
    post?.scheduled_time?.slice(0, 5) ?? "",
  );
  const [platform, setPlatform] = useState<MarketingPlatform>(
    post?.platform ?? "instagram",
  );
  const [contentType, setContentType] =
    useState<MarketingContentType>(
      post?.content_type ?? "feed",
    );
  const [status, setStatus] = useState<MarketingPostStatus>(
    post?.status ?? "planejado",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, saving]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Informe o título da postagem.");
      return;
    }

    if (!scheduledDate) {
      setError("Informe a data da postagem.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEditing && post) {
        const data: UpdateMarketingPostRequest = {
          title: title.trim(),
          description: description.trim() || null,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          platform,
          content_type: contentType,
          status,
        };

        const updatedPost = await updateMarketingPost(
          post.id,
          data,
        );

        onSaved(updatedPost);
        return;
      }

      const data: CreateMarketingPostRequest = {
        title: title.trim(),
        description: description.trim() || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || null,
        platform,
        content_type: contentType,
        status,
      };

      const createdPost = await createMarketingPost(data);

      onSaved(createdPost);
    } catch (err) {
      console.error(err);

      setError(
        isEditing
          ? "Não foi possível atualizar a postagem."
          : "Não foi possível criar a postagem.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {isEditing
                ? "Editar postagem"
                : "Nova postagem"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Atualize as informações do conteúdo."
                : "Planeje um novo conteúdo para o marketing."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <form
          id="marketing-post-form"
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-145px)] overflow-y-auto"
        >
          <div className="space-y-5 p-6">
            {/* TÍTULO */}

            <div>
              <label
                htmlFor="marketing-post-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Título
              </label>

              <input
                id="marketing-post-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex.: Reels — Apartamento Royal Palace"
                maxLength={200}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              />
            </div>

            {/* DESCRIÇÃO */}

            <div>
              <label
                htmlFor="marketing-post-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Descrição
              </label>

              <textarea
                id="marketing-post-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva o conteúdo, ideia, legenda ou observações..."
                rows={4}
                maxLength={5000}
                disabled={saving}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              />
            </div>

            {/* DATA / HORÁRIO */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="marketing-post-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data
                </label>

                <input
                  id="marketing-post-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(event) =>
                    setScheduledDate(event.target.value)
                  }
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="marketing-post-time"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Horário
                </label>

                <input
                  id="marketing-post-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(event) =>
                    setScheduledTime(event.target.value)
                  }
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* PLATAFORMA / TIPO */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="marketing-post-platform"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Plataforma
                </label>

                <select
                  id="marketing-post-platform"
                  value={platform}
                  onChange={(event) =>
                    setPlatform(
                      event.target.value as MarketingPlatform,
                    )
                  }
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="marketing-post-content-type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Tipo de conteúdo
                </label>

                <select
                  id="marketing-post-content-type"
                  value={contentType}
                  onChange={(event) =>
                    setContentType(
                      event.target.value as MarketingContentType,
                    )
                  }
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATUS */}

            <div>
              <label
                htmlFor="marketing-post-status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="marketing-post-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as MarketingPostStatus,
                  )
                }
                disabled={saving}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}
          </div>
        </form>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="marketing-post-form"
            disabled={saving}
            className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>(
    [],
  );
  const [posts, setPosts] = useState<MarketingPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPost, setModalPost] =
    useState<MarketingPost | null>(null);

  const [deletingPostId, setDeletingPostId] = useState<
    number | null
  >(null);

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const { startDate, endDate } = getPostsRange();

      const [tasksData, departmentsData, postsData] =
        await Promise.all([
          getTasks(),
          getDepartments(),
          getMarketingPosts(startDate, endDate),
        ]);

      setTasks(tasksData);
      setDepartments(departmentsData);
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
    void loadDashboard();
  }, []);

  /* =======================================================
     MODAL
  ======================================================= */

  function openCreateModal() {
    setModalPost(null);
    setModalOpen(true);
  }

  function openEditModal(post: MarketingPost) {
    setModalPost(post);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalPost(null);
  }

  function handlePostSaved(savedPost: MarketingPost) {
    setPosts((current) => {
      const exists = current.some(
        (post) => post.id === savedPost.id,
      );

      if (exists) {
        return current.map((post) =>
          post.id === savedPost.id ? savedPost : post,
        );
      }

      return [...current, savedPost];
    });

    closeModal();
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDeletePost(post: MarketingPost) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a postagem "${post.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingPostId(post.id);
    setError("");

    try {
      await deleteMarketingPost(post.id);

      setPosts((current) =>
        current.filter(
          (currentPost) => currentPost.id !== post.id,
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

  const marketingDepartment = useMemo(
    () =>
      departments.find(
        (department) =>
          department.name.trim().toLowerCase() ===
          "marketing",
      ),
    [departments],
  );

  /* =======================================================
     TAREFAS
  ======================================================= */

  const marketingTasks = useMemo(() => {
    if (!marketingDepartment) {
      return [];
    }

    return tasks
      .filter(
        (task) =>
          task.department_id === marketingDepartment.id,
      )
      .sort(sortBySchedule);
  }, [tasks, marketingDepartment]);

  const taskMetrics = useMemo(() => {
    const byStatus = (status: string) =>
      marketingTasks.filter(
        (task) => (task.status as string) === status,
      ).length;

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

  const todayKey = getTodayKey();

  const upcomingPosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.scheduled_date >= todayKey &&
            post.status !== "cancelado",
        )
        .sort(sortBySchedule)
        .slice(0, 6),
    [posts, todayKey],
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-slate-50 to-[#e8eefb] text-slate-900">
      <div className="min-h-screen lg:flex">
        <DashboardSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-345 px-5 py-7 sm:px-8 lg:px-10 xl:px-12">
            {/* HEADER */}

            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.035em] text-slate-900 sm:text-[2.3rem]">
                  Marketing
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  Tarefas do departamento e planejamento de
                  conteúdo.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
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
                  onClick={() => void loadDashboard()}
                  className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* METRICS */}

            <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Tarefas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.total}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  do departamento
                </p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Pendentes
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.pending}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  aguardando execução
                </p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Tarefas concluídas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : taskMetrics.completed}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  finalizadas
                </p>
              </div>

              <div className={`${cardClass} p-5`}>
                <p className="text-sm font-medium text-slate-500">
                  Postagens programadas
                </p>

                <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                  {loading ? "–" : upcomingPosts.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  a partir de hoje
                </p>
              </div>
            </section>

            {/* CONTENT GRID */}

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
                      Cadastre um departamento com o nome
                      "Marketing".
                    </p>
                  </div>
                ) : recentTasks.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Nenhuma tarefa de marketing
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      As tarefas do departamento aparecerão
                      aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 sm:p-4">
                    {recentTasks.map((task) => {
                      const taskStatus =
                        task.status as string;

                      return (
                        <button
                          key={task.id}
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
                              taskStatus,
                            )}`}
                          >
                            {getTaskStatusIcon(
                              taskStatus,
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[15px] font-medium ${
                                taskStatus ===
                                "concluida"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
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
                              taskStatus,
                            )}`}
                          >
                            {getTaskStatusLabel(
                              taskStatus,
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* POSTAGENS */}

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
                    onClick={() =>
                      navigate("/marketing/calendar")
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
                ) : upcomingPosts.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-[15px] font-medium text-slate-700">
                      Nenhuma postagem programada
                    </p>

                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Criar primeira postagem
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 sm:p-4">
                    {upcomingPosts.map((post) => (
                      <div
                        key={post.id}
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 transition duration-200 hover:bg-slate-50 sm:px-4"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(post)
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eaf0fb]">
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
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-900">
                              {post.title}
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
                          </span>

                          {post.scheduled_date ===
                          todayKey ? (
                            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                              Hoje
                            </span>
                          ) : (
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                              title={
                                STATUS_LABELS[
                                  post.status
                                ]
                              }
                            />
                          )}
                        </button>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(post)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Editar postagem"
                            aria-label="Editar postagem"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeletePost(post)
                            }
                            disabled={
                              deletingPostId === post.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Excluir postagem"
                            aria-label="Excluir postagem"
                          >
                            {deletingPostId ===
                            post.id ? (
                              <span className="text-xs">
                                ...
                              </span>
                            ) : (
                              "⌫"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
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
                    Mês atual e os próximos {MONTHS_AHEAD}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(
                  Object.keys(
                    STATUS_LABELS,
                  ) as MarketingPostStatus[]
                ).map((postStatus) => (
                  <div
                    key={postStatus}
                    className="rounded-xl bg-slate-50/80 px-4 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_DOT[postStatus]}`}
                      />

                      <span className="text-sm font-medium text-slate-500">
                        {STATUS_LABELS[postStatus]}
                      </span>
                    </div>

                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                      {loading
                        ? "–"
                        : postMetrics[postStatus]}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* MODAL */}

      {modalOpen && (
        <MarketingPostModal
          post={modalPost}
          onClose={closeModal}
          onSaved={handlePostSaved}
        />
      )}
    </div>
  );
}

export default MarketingDashboard;