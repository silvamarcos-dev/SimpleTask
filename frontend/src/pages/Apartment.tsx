import axios from "axios";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import { deleteApartment, getApartments } from "../services/apartment";

import type { Apartment, ApartmentStatus } from "../types/apartment";

/* =========================================================
   STATUS
========================================================= */

const statusConfig: Record<
  ApartmentStatus,
  { label: string; pill: string; dot: string }
> = {
  ativo: {
    label: "Ativo",
    pill: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },

  manutencao: {
    label: "Manutenção",
    pill: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },

  inativo: {
    label: "Inativo",
    pill: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

const statusFilters = [
  ["todos", "Todos"],
  ["ativo", "Ativos"],
  ["manutencao", "Manutenção"],
  ["inativo", "Inativos"],
] as const;

/* =========================================================
   HELPERS
========================================================= */

function getLocationLabel(apartment: Apartment): string {
  return [
    apartment.building,
    apartment.block ? `Bloco ${apartment.block}` : null,
    `AP ${apartment.apartment}`,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getInitial(apartment: Apartment): string {
  return apartment.title.trim().charAt(0).toUpperCase() || "A";
}

/* =========================================================
   PAGE
========================================================= */

function Apartments() {
  const navigate = useNavigate();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<ApartmentStatus | "todos">(
    "todos",
  );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    async function loadApartments() {
      try {
        setError("");

        const data = await getApartments();
        setApartments(data);
      } catch (loadError) {
        if (
          axios.isAxiosError(loadError) &&
          loadError.response?.status === 401
        ) {
          navigate("/login", { replace: true });
          return;
        }

        setError("Não foi possível carregar os apartamentos.");
      } finally {
        setLoading(false);
      }
    }

    loadApartments();
  }, [navigate]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredApartments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return apartments.filter((apartment) => {
      const matchesStatus =
        statusFilter === "todos" || apartment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        apartment.title,
        apartment.building,
        apartment.apartment,
        apartment.block,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [apartments, search, statusFilter]);

  /* =======================================================
     COUNTERS
  ======================================================= */

  const activeCount = apartments.filter(
    (apartment) => apartment.status === "ativo",
  ).length;

  const maintenanceCount = apartments.filter(
    (apartment) => apartment.status === "manutencao",
  ).length;

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "todos";

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(apartment: Apartment) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o apartamento "${apartment.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(apartment.id);
      setError("");

      await deleteApartment(apartment.id);

      setApartments((current) =>
        current.filter((item) => item.id !== apartment.id),
      );
    } catch {
      setError("Não foi possível excluir o apartamento.");
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-[#e8eefb]">
        <div className="flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-5 text-sm font-medium text-slate-500">
            Carregando apartamentos...
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
                  Apartamentos
                </h1>

                <p className="mt-3 text-[15px] text-slate-500">
                  {apartments.length}{" "}
                  {apartments.length === 1 ? "imóvel" : "imóveis"} cadastrados ·{" "}
                  {activeCount} ativos
                  {maintenanceCount > 0 &&
                    ` · ${maintenanceCount} em manutenção`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/apartments/new")}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-[15px] font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:w-auto"
              >
                <span className="text-lg font-light leading-none">+</span>
                Novo apartamento
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
                TOOLBAR
            ============================================= */}

            <section className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* SEARCH */}

                <div className="relative w-full lg:max-w-sm">
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
                    placeholder="Buscar por título, edifício ou número"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                {/* STATUS FILTER */}

                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                  {statusFilters.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      aria-pressed={statusFilter === value}
                      className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        statusFilter === value
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500">
                    {filteredApartments.length}{" "}
                    {filteredApartments.length === 1
                      ? "resultado"
                      : "resultados"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("todos");
                    }}
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </section>

            {/* =============================================
                EMPTY STATE
            ============================================= */}

            {filteredApartments.length === 0 ? (
              <section className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-white/70 bg-white/90 px-6 py-16 text-center shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="3" width="14" height="18" rx="2.5" />
                    <path d="M9.5 7.5h1M13.5 7.5h1M9.5 11.5h1M13.5 11.5h1M9.5 15.5h1M13.5 15.5h1" />
                  </svg>
                </div>

                <h2 className="mt-4 text-[15px] font-medium text-slate-700">
                  {apartments.length === 0
                    ? "Você ainda não cadastrou apartamentos"
                    : "Nenhum apartamento com esses filtros"}
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {apartments.length === 0
                    ? "Cadastre seus imóveis para vincular tarefas e manutenções a cada endereço."
                    : "Tente outro termo de busca ou volte para todos os status."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (apartments.length === 0) {
                      navigate("/apartments/new");
                      return;
                    }

                    setSearch("");
                    setStatusFilter("todos");
                  }}
                  className="mt-5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  {apartments.length === 0
                    ? "Cadastrar o primeiro apartamento"
                    : "Limpar filtros"}
                </button>
              </section>
            ) : (
              /* =============================================
                  GRID
              ============================================= */

              <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredApartments.map((apartment) => {
                  const status = statusConfig[apartment.status];
                  const isDeleting = deletingId === apartment.id;

                  return (
                    <article
                      key={apartment.id}
                      className={`flex flex-col rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm transition duration-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.09)] ${
                        isDeleting ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0fb] text-sm font-semibold text-slate-600">
                            {getInitial(apartment)}
                          </span>

                          <div className="min-w-0">
                            <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                              {apartment.title}
                            </h2>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {getLocationLabel(apartment)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </div>

                      {/* DESCRIPTION */}

                      {apartment.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                          {apartment.description}
                        </p>
                      )}

                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                          <p className="text-xs text-slate-400">Edifício</p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-700">
                            {apartment.building}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                          <p className="text-xs text-slate-400">Apartamento</p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-700">
                            {apartment.apartment}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/apartments/${apartment.id}/edit`)
                          }
                          className="h-10 flex-1 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(apartment)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-red-500 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting && (
                            <span className="h-3 w-3 animate-spin rounded-full border border-red-300 border-t-red-600" />
                          )}
                          {isDeleting ? "Excluindo" : "Excluir"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Apartments;