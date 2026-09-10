import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import {
  deleteMaintenance,
  getMaintenances,
} from "../services/maintenance";
import { getCurrentUser } from "../services/user";

import type { UserResponse } from "../types/auth";
import type {
  Maintenance as MaintenanceData,
  MaintenancePriority,
  MaintenanceStatus,
} from "../types/maintenance";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string | null): string {
  if (!date) {
    return "Sem data definida";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getPriorityLabel(
  priority: MaintenancePriority,
): string {
  const labels: Record<MaintenancePriority, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  };

  return labels[priority];
}

function getStatusLabel(
  status: MaintenanceStatus,
): string {
  const labels: Record<MaintenanceStatus, string> = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    agendada: "Agendada",
    concluida: "Concluída",
  };

  return labels[status];
}

function getLocationLabel(
  maintenance: MaintenanceData,
): string {
  const parts = [
    maintenance.building,
    maintenance.block
      ? `Bloco ${maintenance.block}`
      : null,
    maintenance.apartment
      ? `AP. ${maintenance.apartment}`
      : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return "Localização não informada";
  }

  return parts.join(" • ");
}

/* =========================================================
   BADGES
========================================================= */

function PriorityBadge({
  priority,
}: {
  priority: MaintenancePriority;
}) {
  const className = {
    baixa: "border-blue-200 bg-blue-50 text-blue-700",
    media: "border-amber-200 bg-amber-50 text-amber-700",
    alta: "border-red-200 bg-red-50 text-red-700",
  }[priority];

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  const className = {
    pendente:
      "border-amber-200 bg-amber-50 text-amber-700",
    em_andamento:
      "border-blue-200 bg-blue-50 text-blue-700",
    agendada:
      "border-zinc-200 bg-zinc-100 text-zinc-600",
    concluida:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[status];

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* =========================================================
   MAINTENANCE PAGE
========================================================= */

function MaintenancePage() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<UserResponse | null>(null);

  const [maintenances, setMaintenances] =
    useState<MaintenanceData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [redirecting, setRedirecting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadMaintenance() {
      try {
        const [
          currentUser,
          allMaintenances,
        ] = await Promise.all([
          getCurrentUser(),
          getMaintenances(),
        ]);

        setUser(currentUser);
        setMaintenances(allMaintenances);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          setRedirecting(true);
          return;
        }

        setError(
          "Não foi possível carregar as manutenções.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMaintenance();
  }, []);

  /* =======================================================
     DELETE MAINTENANCE
  ======================================================= */

  async function handleDeleteMaintenance(
    maintenance: MaintenanceData,
  ) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a manutenção "${maintenance.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(maintenance.id);
      setError("");

      await deleteMaintenance(maintenance.id);

      setMaintenances((currentMaintenances) =>
        currentMaintenances.filter(
          (item) => item.id !== maintenance.id,
        ),
      );
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setRedirecting(true);
        return;
      }

      setError(
        "Não foi possível excluir a manutenção. Tente novamente.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     EDIT MAINTENANCE
  ======================================================= */

  function handleEditMaintenance(
    maintenance: MaintenanceData,
  ) {
    navigate(
      `/dashboard/maintenance/${maintenance.id}/edit`,
    );
  }

  /* =======================================================
     REDIRECT
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
              : "Carregando manutenções..."}
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !user) {
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

        <DashboardSidebar />

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
                navigate("/login")
              }
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
            >
              Sair
            </button>
          </div>

          {/* CONTENT */}

          <div className="mx-auto max-w-375 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            {/* =================================================
                HEADER
            ================================================= */}

            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  Operação
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  Manutenções
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Acompanhe e organize as manutenções dos seus imóveis.
                </p>
              </div>

              {/* =================================================
                  ADD BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard/maintenance/new",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Nova manutenção
              </button>
            </header>

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-xs font-semibold text-red-600 hover:text-red-800"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* TOTAL */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    Total
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17v3h3l5.6-5.6a4 4 0 0 0 5.1-5.1l-2.1 2.1-2.1-.7-.7-2.1z" />
                      <path d="m14 14 6 6" />
                    </svg>
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-zinc-950">
                  {maintenances.length}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Manutenções cadastradas
                </p>
              </div>

              {/* PENDING */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    Pendentes
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />

                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-amber-500">
                  {
                    maintenances.filter(
                      (maintenance) =>
                        maintenance.status ===
                        "pendente",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Aguardando atendimento
                </p>
              </div>

              {/* IN PROGRESS */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    Em andamento
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 2v4" />
                      <path d="M12 18v4" />
                      <path d="m4.93 4.93 2.83 2.83" />
                      <path d="m16.24 16.24 2.83 2.83" />
                      <path d="M2 12h4" />
                      <path d="M18 12h4" />
                      <path d="m4.93 19.07 2.83-2.83" />
                      <path d="m16.24 7.76 2.83-2.83" />
                    </svg>
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-blue-600">
                  {
                    maintenances.filter(
                      (maintenance) =>
                        maintenance.status ===
                        "em_andamento",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Serviços em execução
                </p>
              </div>

              {/* COMPLETED */}

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    Concluídas
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-emerald-600">
                  {
                    maintenances.filter(
                      (maintenance) =>
                        maintenance.status ===
                        "concluida",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Serviços finalizados
                </p>
              </div>
            </section>

            {/* =================================================
                LIST
            ================================================= */}

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Suas manutenções
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Acompanhe os serviços programados e em andamento.
                </p>
              </div>

              {maintenances.length === 0 ? (
                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17v3h3l5.6-5.6a4 4 0 0 0 5.1-5.1l-2.1 2.1-2.1-.7-.7-2.1z" />

                      <path d="m14 14 6 6" />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                    Nenhuma manutenção cadastrada
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
                    Cadastre sua primeira manutenção para começar a acompanhar os serviços.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/dashboard/maintenance/new",
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                  >
                    <span className="text-base leading-none">
                      +
                    </span>

                    Nova manutenção
                  </button>
                </div>
              ) : (
                /* =================================================
                   MAINTENANCE CARDS
                ================================================= */

                <div className="grid gap-4 xl:grid-cols-2">
                  {maintenances.map(
                    (maintenance) => (
                      <article
                        key={maintenance.id}
                        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        {/* =================================================
                           CARD HEADER
                        ================================================= */}

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-zinc-950">
                                {
                                  maintenance.title
                                }
                              </h3>

                              <PriorityBadge
                                priority={
                                  maintenance.priority
                                }
                              />
                            </div>

                            {maintenance.description && (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                                {
                                  maintenance.description
                                }
                              </p>
                            )}
                          </div>

                          {/* =================================================
                             ACTIONS
                          ================================================= */}

                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge
                              status={
                                maintenance.status
                              }
                            />

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEditMaintenance(
                                  maintenance,
                                )
                              }
                              title="Editar manutenção"
                              aria-label={`Editar manutenção ${maintenance.title}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M12 20h9" />

                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                              </svg>
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMaintenance(
                                  maintenance,
                                )
                              }
                              disabled={
                                deletingId ===
                                maintenance.id
                              }
                              title="Excluir manutenção"
                              aria-label={`Excluir manutenção ${maintenance.title}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              maintenance.id ? (
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="opacity-25"
                                  />

                                  <path
                                    d="M21 12a9 9 0 0 1-9 9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <path d="M3 6h18" />

                                  <path d="M8 6V4h8v2" />

                                  <path d="M19 6l-1 15H6L5 6" />

                                  <path d="M10 11v6" />

                                  <path d="M14 11v6" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* =================================================
                           LOCATION
                        ================================================= */}

                        <div className="mt-5 flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M3 21h18" />
                              <path d="M5 21V5l7-3 7 3v16" />
                              <path d="M9 21v-5h6v5" />
                              <path d="M9 7h1" />
                              <path d="M14 7h1" />
                              <path d="M9 11h1" />
                              <path d="M14 11h1" />
                            </svg>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-zinc-700">
                              Localização
                            </p>

                            <p className="mt-0.5 text-xs text-zinc-400">
                              {
                                getLocationLabel(
                                  maintenance,
                                )
                              }
                            </p>
                          </div>
                        </div>

                        {/* =================================================
                           DETAILS
                        ================================================= */}

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {/* DATE */}

                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="17"
                                  rx="2"
                                />

                                <path d="M16 2v4M8 2v4M3 10h18" />
                              </svg>
                            </div>

                            <div>
                              <p className="text-[11px] text-zinc-400">
                                Agendamento
                              </p>

                              <p className="mt-0.5 text-xs font-medium text-zinc-700">
                                {
                                  formatDate(
                                    maintenance.scheduled_date,
                                  )
                                }
                              </p>
                            </div>
                          </div>

                          {/* CATEGORY */}

                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.83 0l3.35-3.35a2 2 0 0 0 0-2.83Z" />

                                <circle
                                  cx="7.5"
                                  cy="6.5"
                                  r="1"
                                />
                              </svg>
                            </div>

                            <div>
                              <p className="text-[11px] text-zinc-400">
                                Categoria
                              </p>

                              <p className="mt-0.5 text-xs font-medium text-zinc-700">
                                {
                                  maintenance.category ||
                                  "Não informada"
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* =================================================
                           PROVIDER
                        ================================================= */}

                        {maintenance.provider_name && (
                          <div className="mt-4 border-t border-zinc-100 pt-4">
                            <p className="text-[11px] text-zinc-400">
                              Prestador
                            </p>

                            <div className="mt-1 flex items-center justify-between gap-3">
                              <p className="text-xs font-medium text-zinc-700">
                                {
                                  maintenance.provider_name
                                }
                              </p>

                              {maintenance.provider_phone && (
                                <p className="text-xs text-zinc-400">
                                  {
                                    maintenance.provider_phone
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MaintenancePage;