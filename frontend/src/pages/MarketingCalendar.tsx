import { useEffect, useMemo, useState, type FormEvent } from "react";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import {
  createMarketingPost,
  deleteMarketingPost,
  getMarketingPosts,
  updateMarketingPost,
} from "../services/marketingPosts";

import type {
  CreateMarketingPostRequest,
  MarketingContentType,
  MarketingPlatform,
  MarketingPost,
  MarketingPostStatus,
  UpdateMarketingPostRequest,
} from "../types/marketingPost";

/* =========================================================
   TYPES
========================================================= */

type CalendarDay = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type LoadResult = {
  key: string;
  posts: MarketingPost[];
  error: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const PLATFORM_OPTIONS: {
  value: MarketingPlatform;
  label: string;
  pill: string;
  active: string;
}[] = [
  {
    value: "instagram",
    label: "Instagram",
    pill: "bg-pink-50 text-pink-700",
    active: "border-pink-300 bg-pink-50 text-pink-700",
  },
  {
    value: "facebook",
    label: "Facebook",
    pill: "bg-blue-50 text-blue-700",
    active: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    pill: "bg-sky-50 text-sky-700",
    active: "border-sky-300 bg-sky-50 text-sky-700",
  },
  {
    value: "tiktok",
    label: "TikTok",
    pill: "bg-slate-100 text-slate-700",
    active: "border-slate-400 bg-slate-100 text-slate-800",
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
  dot: string;
  active: string;
}[] = [
  {
    value: "planejado",
    label: "Planejado",
    dot: "bg-slate-400",
    active: "border-slate-400 bg-slate-100 text-slate-800",
  },
  {
    value: "em_producao",
    label: "Em produção",
    dot: "bg-amber-400",
    active: "border-amber-400 bg-amber-50 text-amber-700",
  },
  {
    value: "publicado",
    label: "Publicado",
    dot: "bg-emerald-500",
    active: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  {
    value: "cancelado",
    label: "Cancelado",
    dot: "bg-red-500",
    active: "border-red-400 bg-red-50 text-red-700",
  },
];

const platformConfig = Object.fromEntries(
  PLATFORM_OPTIONS.map((option) => [option.value, option]),
) as Record<MarketingPlatform, (typeof PLATFORM_OPTIONS)[number]>;

const statusConfig = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option]),
) as Record<MarketingPostStatus, (typeof STATUS_OPTIONS)[number]>;

const contentTypeLabels = Object.fromEntries(
  CONTENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<MarketingContentType, string>;

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatLongDate(dateKey: string): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateKey}T00:00:00`));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getCalendarDays(currentMonth: Date): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingDays = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  const todayKey = formatDateKey(new Date());

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - leadingDays + 1);
    const dateKey = formatDateKey(date);

    return {
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
    };
  });
}

function getMonthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    startDate: formatDateKey(new Date(year, month, 1)),
    endDate: formatDateKey(new Date(year, month + 1, 0)),
  };
}

function formatPostTime(post: MarketingPost): string {
  return post.scheduled_time ? post.scheduled_time.slice(0, 5) : "";
}

function emptyForm(dateKey: string): CreateMarketingPostRequest {
  return {
    title: "",
    description: "",
    scheduled_date: dateKey,
    scheduled_time: "",
    platform: "instagram",
    content_type: "feed",
    status: "planejado",
  };
}

/* =========================================================
   SHARED CLASSES
========================================================= */

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

const labelClass = "mb-2 block text-sm font-medium text-slate-600";

const optionBaseClass =
  "rounded-xl border px-3 py-2.5 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900";

const optionIdleClass =
  "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700";

const cardClass =
  "rounded-2xl border border-white/70 bg-white/90 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm";

/* =========================================================
   ICONS
========================================================= */

function CloseIcon() {
  return (
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
  );
}

function EditIcon() {
  return (
    <svg
      width="15"
      height="15"
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
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MarketingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
  });

  const [reloadToken, setReloadToken] = useState(0);

  const [result, setResult] = useState<LoadResult>({
    key: "",
    posts: [],
    error: "",
  });

  /* CREATE / EDIT */

  const [isPostModalOpen, setIsPostModalOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState<MarketingPost | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [form, setForm] =
    useState<CreateMarketingPostRequest>(() =>
      emptyForm(formatDateKey(new Date())),
    );

  /* DETAILS */

  const [selectedPost, setSelectedPost] =
    useState<MarketingPost | null>(null);

  /* DELETE */

  const [deletingPostId, setDeletingPostId] =
    useState<number | null>(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const { startDate, endDate } =
    getMonthRange(currentMonth);

  const requestKey = `${startDate}:${reloadToken}`;

  useEffect(() => {
    let cancelled = false;

    getMarketingPosts(startDate, endDate)
      .then((data) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            posts: data,
            error: "",
          });
        }
      })
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setResult({
            key: requestKey,
            posts: [],
            error:
              "Não foi possível carregar as postagens de marketing.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, requestKey]);

  const loading = result.key !== requestKey;
  const posts = result.posts;
  const loadError = result.error;

  /* =======================================================
     MODAIS: ESC + SCROLL
  ======================================================= */

  const anyModalOpen =
    isPostModalOpen || selectedPost !== null;

  useEffect(() => {
    if (!anyModalOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isSaving) {
        return;
      }

      setSelectedPost(null);
      setIsPostModalOpen(false);
      setEditingPost(null);
      setFormError("");
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [anyModalOpen, isSaving]);

  /* =======================================================
     DERIVED
  ======================================================= */

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth],
  );

  const postsByDate = useMemo(() => {
    const grouped: Record<
      string,
      MarketingPost[]
    > = {};

    for (const post of posts) {
      (grouped[post.scheduled_date] ??= []).push(
        post,
      );
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) =>
        (a.scheduled_time ?? "99:99").localeCompare(
          b.scheduled_time ?? "99:99",
        ),
      );
    }

    return grouped;
  }, [posts]);

  const statusCounts = useMemo(() => {
    const counts: Record<
      MarketingPostStatus,
      number
    > = {
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

  const now = new Date();

  const isCurrentMonthView =
    currentMonth.getMonth() === now.getMonth() &&
    currentMonth.getFullYear() ===
      now.getFullYear();

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function goToMonth(offset: number) {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1,
        ),
    );
  }

  function goToToday() {
    setCurrentMonth(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    );
  }

  function refresh() {
    setReloadToken((token) => token + 1);
  }

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  function openCreateModal(
    dateKey = formatDateKey(new Date()),
  ) {
    setEditingPost(null);
    setFormError("");

    setForm(emptyForm(dateKey));

    setIsPostModalOpen(true);
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  function openEditModal(post: MarketingPost) {
    setEditingPost(post);
    setFormError("");

    setForm({
      title: post.title,
      description: post.description ?? "",
      scheduled_date: post.scheduled_date,
      scheduled_time: post.scheduled_time
        ? post.scheduled_time.slice(0, 5)
        : "",
      platform: post.platform,
      content_type: post.content_type,
      status: post.status,
    });

    setSelectedPost(null);
    setIsPostModalOpen(true);
  }

  /* =======================================================
     CLOSE POST MODAL
  ======================================================= */

  function closePostModal() {
    if (isSaving) {
      return;
    }

    setIsPostModalOpen(false);
    setEditingPost(null);
    setFormError("");
  }

  /* =======================================================
     FORM
  ======================================================= */

  function updateForm<
    K extends keyof CreateMarketingPostRequest,
  >(
    field: K,
    value: CreateMarketingPostRequest[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  async function handleSavePost(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError(
        "Informe um título para a postagem.",
      );

      return;
    }

    if (!form.scheduled_date) {
      setFormError(
        "Informe a data da postagem.",
      );

      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingPost) {
        const updateData: UpdateMarketingPostRequest =
          {
            title: form.title.trim(),
            description:
              form.description?.trim() || null,
            scheduled_date:
              form.scheduled_date,
            scheduled_time:
              form.scheduled_time || null,
            platform: form.platform,
            content_type:
              form.content_type,
            status: form.status,
          };

        await updateMarketingPost(
          editingPost.id,
          updateData,
        );
      } else {
        const createData: CreateMarketingPostRequest =
          {
            title: form.title.trim(),
            description:
              form.description?.trim() || null,
            scheduled_date:
              form.scheduled_date,
            scheduled_time:
              form.scheduled_time || null,
            platform: form.platform,
            content_type:
              form.content_type,
            status: form.status,
          };

        await createMarketingPost(
          createData,
        );
      }

      const savedDate = new Date(
        `${form.scheduled_date}T00:00:00`,
      );

      setIsPostModalOpen(false);
      setEditingPost(null);

      setCurrentMonth(
        new Date(
          savedDate.getFullYear(),
          savedDate.getMonth(),
          1,
        ),
      );

      refresh();
    } catch (err) {
      console.error(err);

      setFormError(
        editingPost
          ? "Não foi possível atualizar a postagem."
          : "Não foi possível criar a postagem.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDeletePost(
    post: MarketingPost,
  ) {
    if (deletingPostId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir a postagem "${post.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPostId(post.id);

      await deleteMarketingPost(post.id);

      setSelectedPost(null);

      setResult((current) => ({
        ...current,
        posts: current.posts.filter(
          (item) => item.id !== post.id,
        ),
      }));
    } catch (err) {
      console.error(err);

      window.alert(
        "Não foi possível excluir a postagem. Tente novamente.",
      );
    } finally {
      setDeletingPostId(null);
    }
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
            {/* HEADER */}

            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.035em] text-slate-900 sm:text-[2.3rem]">
                  Calendário de marketing
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  {loading
                    ? "Carregando postagens..."
                    : `${posts.length} ${
                        posts.length === 1
                          ? "postagem"
                          : "postagens"
                      } em ${formatMonthTitle(
                        currentMonth,
                      ).toLowerCase()}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  openCreateModal()
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

            {loadError && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={refresh}
                  className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* STATUS SUMMARY */}

            <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATUS_OPTIONS.map(
                (status) => (
                  <div
                    key={status.value}
                    className={`${cardClass} p-5`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${status.dot}`}
                      />

                      <p className="text-sm font-medium text-slate-500">
                        {status.label}
                      </p>
                    </div>

                    <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
                      {loading
                        ? "–"
                        : statusCounts[
                            status.value
                          ]}
                    </p>
                  </div>
                ),
              )}
            </section>

            {/* CALENDAR */}

            <section
              className={`mt-5 overflow-hidden ${cardClass}`}
            >
              {/* CONTROLS */}

              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      goToMonth(-1)
                    }
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
                    {formatMonthTitle(
                      currentMonth,
                    )}
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      goToMonth(1)
                    }
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
                      onClick={goToToday}
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      Voltar para hoje
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {PLATFORM_OPTIONS.map(
                      (platform) => (
                        <span
                          key={platform.value}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${platform.pill}`}
                        >
                          {platform.label}
                        </span>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={refresh}
                    disabled={loading}
                    aria-label="Atualizar"
                    title="Atualizar"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed"
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
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    >
                      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                      <path d="M4 5v4h4" />
                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                      <path d="M20 19v-4h-4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* GRID */}

              <div className="overflow-x-auto">
                <div
                  className={`min-w-[900px] transition-opacity duration-200 ${
                    loading
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
                    {WEEK_DAYS.map(
                      (day) => (
                        <div
                          key={day}
                          className="px-3 py-3 text-center"
                        >
                          <span className="text-xs font-medium text-slate-400">
                            {day}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map(
                      (day) => {
                        const dayPosts =
                          postsByDate[
                            day.dateKey
                          ] ?? [];

                        return (
                          <div
                            key={day.dateKey}
                            className={`group relative min-h-36 border-b border-r border-slate-100 p-2 sm:p-2.5 ${
                              day.isCurrentMonth
                                ? "bg-white"
                                : "bg-slate-50/50"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                  day.isToday
                                    ? "bg-slate-900 text-white"
                                    : day.isCurrentMonth
                                      ? "text-slate-700"
                                      : "text-slate-300"
                                }`}
                              >
                                {day.date.getDate()}
                              </span>

                              {dayPosts.length >
                                0 && (
                                <span className="text-[10px] font-medium text-slate-300">
                                  {dayPosts.length}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {dayPosts
                                .slice(0, 3)
                                .map(
                                  (post) => (
                                    <div
                                      key={post.id}
                                      className={`group/post relative rounded-lg ${
                                        platformConfig[
                                          post
                                            .platform
                                        ].pill
                                      } ${
                                        post.status ===
                                        "cancelado"
                                          ? "opacity-50"
                                          : ""
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedPost(
                                            post,
                                          )
                                        }
                                        className="block w-full rounded-lg px-2 py-1.5 text-left transition duration-200 hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                                      >
                                        <span className="flex min-w-0 items-center gap-1.5 pr-12">
                                          <span
                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                              statusConfig[
                                                post
                                                  .status
                                              ].dot
                                            }`}
                                          />

                                          <span
                                            className={`min-w-0 truncate text-[11px] font-medium ${
                                              post.status ===
                                              "cancelado"
                                                ? "line-through"
                                                : ""
                                            }`}
                                          >
                                            {
                                              post.title
                                            }
                                          </span>
                                        </span>

                                        <span className="mt-0.5 block pl-3 text-[10px] opacity-70">
                                          {
                                            contentTypeLabels[
                                              post
                                                .content_type
                                            ]
                                          }

                                          {post.scheduled_time &&
                                            ` · ${formatPostTime(
                                              post,
                                            )}`}
                                        </span>
                                      </button>

                                      {/* AÇÕES */}

                                      <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 transition group-hover/post:opacity-100">
                                        <button
                                          type="button"
                                          onClick={(
                                            event,
                                          ) => {
                                            event.stopPropagation();
                                            openEditModal(
                                              post,
                                            );
                                          }}
                                          title="Editar postagem"
                                          aria-label="Editar postagem"
                                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
                                        >
                                          <EditIcon />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(
                                            event,
                                          ) => {
                                            event.stopPropagation();
                                            void handleDeletePost(
                                              post,
                                            );
                                          }}
                                          disabled={
                                            deletingPostId ===
                                            post.id
                                          }
                                          title="Excluir postagem"
                                          aria-label="Excluir postagem"
                                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {deletingPostId ===
                                          post.id ? (
                                            <span className="text-[9px]">
                                              ...
                                            </span>
                                          ) : (
                                            <TrashIcon />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                )}

                              {dayPosts.length >
                                3 && (
                                <p className="px-2 text-[10px] font-medium text-slate-400">
                                  +{" "}
                                  {dayPosts.length -
                                    3}{" "}
                                  outras
                                </p>
                              )}
                            </div>

                            {day.isCurrentMonth &&
                              dayPosts.length ===
                                0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCreateModal(
                                      day.dateKey,
                                    )
                                  }
                                  aria-label={`Nova postagem em ${day.dateKey}`}
                                  className="absolute bottom-2 right-2 hidden rounded-lg px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 group-hover:block"
                                >
                                  + postagem
                                </button>
                              )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* LEGEND */}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 sm:px-6">
                {STATUS_OPTIONS.map(
                  (status) => (
                    <span
                      key={status.value}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${status.dot}`}
                      />

                      {status.label}
                    </span>
                  ),
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Fechar"
            onClick={closePostModal}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketing-post-modal-title"
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-h-[88vh] sm:rounded-3xl"
          >
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div>
                <h2
                  id="marketing-post-modal-title"
                  className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
                >
                  {editingPost
                    ? "Editar postagem"
                    : "Nova postagem"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingPost
                    ? "Atualize as informações da publicação."
                    : "Planeje uma publicação no calendário de conteúdo."}
                </p>
              </div>

              <button
                type="button"
                onClick={closePostModal}
                disabled={isSaving}
                aria-label="Fechar"
                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseIcon />
              </button>
            </div>

            {/* FORM */}

            <form
              id="marketing-post-form"
              onSubmit={handleSavePost}
              className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8"
            >
              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* TÍTULO */}

              <div>
                <label
                  className={labelClass}
                  htmlFor="post-title"
                >
                  Título
                </label>

                <input
                  id="post-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Post sobre gestão de imóveis"
                  maxLength={200}
                  required
                  disabled={isSaving}
                  className={fieldClass}
                />
              </div>

              {/* DESCRIÇÃO */}

              <div>
                <label
                  className={labelClass}
                  htmlFor="post-description"
                >
                  Descrição
                </label>

                <textarea
                  id="post-description"
                  value={
                    form.description ?? ""
                  }
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Roteiro, legenda, referências..."
                  rows={4}
                  maxLength={5000}
                  disabled={isSaving}
                  className={`${fieldClass} resize-none leading-6`}
                />
              </div>

              {/* DATA / HORÁRIO */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className={labelClass}
                    htmlFor="post-date"
                  >
                    Data
                  </label>

                  <input
                    id="post-date"
                    type="date"
                    value={
                      form.scheduled_date
                    }
                    onChange={(event) =>
                      updateForm(
                        "scheduled_date",
                        event.target.value,
                      )
                    }
                    required
                    disabled={isSaving}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    className={labelClass}
                    htmlFor="post-time"
                  >
                    Horário
                  </label>

                  <input
                    id="post-time"
                    type="time"
                    value={
                      form.scheduled_time ??
                      ""
                    }
                    onChange={(event) =>
                      updateForm(
                        "scheduled_time",
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                    className={fieldClass}
                  />
                </div>
              </div>

              {/* PLATAFORMA */}

              <div>
                <span className={labelClass}>
                  Plataforma
                </span>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PLATFORM_OPTIONS.map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateForm(
                            "platform",
                            option.value,
                          )
                        }
                        disabled={isSaving}
                        aria-pressed={
                          form.platform ===
                          option.value
                        }
                        className={`${optionBaseClass} ${
                          form.platform ===
                          option.value
                            ? option.active
                            : optionIdleClass
                        }`}
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* FORMATO */}

              <div>
                <span className={labelClass}>
                  Formato
                </span>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CONTENT_TYPE_OPTIONS.map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateForm(
                            "content_type",
                            option.value,
                          )
                        }
                        disabled={isSaving}
                        aria-pressed={
                          form.content_type ===
                          option.value
                        }
                        className={`${optionBaseClass} ${
                          form.content_type ===
                          option.value
                            ? "border-slate-900 bg-slate-900 text-white"
                            : optionIdleClass
                        }`}
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* STATUS */}

              <div>
                <span className={labelClass}>
                  Status
                </span>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateForm(
                            "status",
                            option.value,
                          )
                        }
                        disabled={isSaving}
                        aria-pressed={
                          form.status ===
                          option.value
                        }
                        className={`${optionBaseClass} inline-flex items-center justify-center gap-2 ${
                          form.status ===
                          option.value
                            ? option.active
                            : optionIdleClass
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${option.dot}`}
                        />

                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </form>

            {/* FOOTER */}

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={closePostModal}
                disabled={isSaving}
                className="h-11 rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form="marketing-post-form"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {isSaving
                  ? "Salvando..."
                  : editingPost
                    ? "Salvar alterações"
                    : "Criar postagem"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() =>
              setSelectedPost(null)
            }
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-detail-title"
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:rounded-3xl"
          >
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="min-w-0">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      platformConfig[
                        selectedPost.platform
                      ].pill
                    }`}
                  >
                    {
                      platformConfig[
                        selectedPost.platform
                      ].label
                    }
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {
                      contentTypeLabels[
                        selectedPost
                          .content_type
                      ]
                    }
                  </span>
                </div>

                <h2
                  id="post-detail-title"
                  className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
                >
                  {selectedPost.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPost(null)
                }
                aria-label="Fechar"
                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <CloseIcon />
              </button>
            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50/80 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Data
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatLongDate(
                      selectedPost.scheduled_date,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50/80 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Horário
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPost.scheduled_time
                      ? formatPostTime(
                          selectedPost,
                        )
                      : "Não definido"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
                    statusConfig[
                      selectedPost.status
                    ].active
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      statusConfig[
                        selectedPost.status
                      ].dot
                    }`}
                  />

                  {
                    statusConfig[
                      selectedPost.status
                    ].label
                  }
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Descrição
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedPost.description ||
                    "Nenhuma descrição adicionada."}
                </p>
              </div>

              <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                Criado em{" "}
                {new Date(
                  selectedPost.created_at,
                ).toLocaleString("pt-BR")}
              </p>
            </div>

            {/* ACTIONS */}

            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() =>
                  openEditModal(
                    selectedPost,
                  )
                }
                disabled={
                  deletingPostId ===
                  selectedPost.id
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <EditIcon />

                Editar
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDeletePost(
                    selectedPost,
                  )
                }
                disabled={
                  deletingPostId ===
                  selectedPost.id
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon />

                {deletingPostId ===
                selectedPost.id
                  ? "Excluindo..."
                  : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketingCalendar;