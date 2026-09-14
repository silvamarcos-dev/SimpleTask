import axios from "axios";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import {
  deleteApartment,
  getApartments,
} from "../services/apartment";

import type {
  Apartment,
  ApartmentStatus,
} from "../types/apartment";


/* =========================================================
   STATUS
========================================================= */

const statusConfig: Record<
  ApartmentStatus,
  {
    label: string;
    className: string;
  }
> = {
  ativo: {
    label: "Ativo",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },

  inativo: {
    label: "Inativo",
    className:
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  },

  manutencao: {
    label: "Manutenção",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
};


/* =========================================================
   HELPERS
========================================================= */

function getLocationLabel(
  apartment: Apartment,
): string {
  const parts = [
    apartment.building,
    apartment.block
      ? `Bloco ${apartment.block}`
      : null,
    `AP. ${apartment.apartment}`,
  ].filter(Boolean);

  return parts.join(" • ");
}


/* =========================================================
   PAGE
========================================================= */

function Apartments() {
  const navigate = useNavigate();

  const [apartments, setApartments] =
    useState<Apartment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<ApartmentStatus | "todos">(
      "todos",
    );

  const [deletingId, setDeletingId] =
    useState<number | null>(null);


  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    async function loadApartments() {
      try {
        setError("");

        const data =
          await getApartments();

        setApartments(data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          "Não foi possível carregar os apartamentos.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadApartments();
  }, [navigate]);


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredApartments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return apartments.filter(
        (apartment) => {
          const matchesSearch =
            !normalizedSearch ||
            apartment.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            apartment.building
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            apartment.apartment
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            apartment.block
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter === "todos" ||
            apartment.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      apartments,
      search,
      statusFilter,
    ]);


  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(
    apartment: Apartment,
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir o apartamento "${apartment.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        apartment.id,
      );

      setError("");

      await deleteApartment(
        apartment.id,
      );

      setApartments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              apartment.id,
          ),
      );
    } catch {
      setError(
        "Não foi possível excluir o apartamento.",
      );
    } finally {
      setDeletingId(null);
    }
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
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-900">
      <div className="min-h-screen lg:flex">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <DashboardSidebar />


        {/* =================================================
            MAIN
        ================================================= */}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-375 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

              <div className="min-w-0">

                <p className="text-sm font-medium text-zinc-400">
                  Gestão de imóveis
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                  Apartamentos
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                  Cadastre e organize os apartamentos utilizados pelas operações do Simple Task.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/apartments/new",
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md sm:w-auto"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Novo apartamento
              </button>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                {/* SEARCH */}

                <div className="relative w-full lg:max-w-md">

                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />

                    <path d="m20 20-3.5-3.5" />
                  </svg>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Buscar apartamento..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                  />

                </div>


                {/* STATUS FILTER */}

                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">

                  {(
                    [
                      [
                        "todos",
                        "Todos",
                      ],
                      [
                        "ativo",
                        "Ativos",
                      ],
                      [
                        "manutencao",
                        "Manutenção",
                      ],
                      [
                        "inativo",
                        "Inativos",
                      ],
                    ] as const
                  ).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setStatusFilter(
                            value,
                          )
                        }
                        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          statusFilter ===
                          value
                            ? "bg-zinc-950 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
                        }`}
                      >
                        {label}
                      </button>
                    ),
                  )}

                </div>

              </div>

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="mb-4 flex items-center justify-between gap-3">

              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {filteredApartments.length}{" "}
                  {filteredApartments.length ===
                  1
                    ? "apartamento"
                    : "apartamentos"}
                </p>

                {search && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Resultado da busca por “
                    {search}”
                  </p>
                )}
              </div>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-950"
                >
                  Limpar busca
                </button>
              )}

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredApartments.length ===
              0 && (
              <section className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">

                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V6l7-3 7 3v15" />
                    <path d="M9 21v-5h6v5" />
                    <path d="M9 9h1" />
                    <path d="M14 9h1" />
                    <path d="M9 12h1" />
                    <path d="M14 12h1" />
                  </svg>

                </div>

                <h2 className="mt-5 text-base font-semibold text-zinc-950">
                  {apartments.length ===
                  0
                    ? "Nenhum apartamento cadastrado"
                    : "Nenhum resultado encontrado"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  {apartments.length ===
                  0
                    ? "Comece cadastrando o primeiro apartamento para centralizar seus imóveis."
                    : "Tente alterar os filtros ou utilizar outro termo de busca."}
                </p>

                {apartments.length ===
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/apartments/new",
                      )
                    }
                    className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Cadastrar apartamento
                  </button>
                )}

              </section>
            )}


            {/* =================================================
                APARTMENT GRID
            ================================================= */}

            {filteredApartments.length >
              0 && (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {filteredApartments.map(
                  (apartment) => {
                    const status =
                      statusConfig[
                        apartment.status
                      ];

                    const isDeleting =
                      deletingId ===
                      apartment.id;

                    return (
                      <article
                        key={
                          apartment.id
                        }
                        className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                      >

                        {/* CARD HEADER */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">

                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M3 21h18" />
                                <path d="M5 21V6l7-3 7 3v15" />
                                <path d="M9 21v-5h6v5" />
                                <path d="M9 9h1" />
                                <path d="M14 9h1" />
                                <path d="M9 12h1" />
                                <path d="M14 12h1" />
                              </svg>

                            </div>

                            <div className="min-w-0">

                              <h2 className="truncate text-sm font-bold text-zinc-950">
                                {apartment.title}
                              </h2>

                              <p className="mt-1 truncate text-xs text-zinc-400">
                                {getLocationLabel(
                                  apartment,
                                )}
                              </p>

                            </div>

                          </div>


                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </div>


                        {/* DESCRIPTION */}

                        {apartment.description && (
                          <p className="mt-5 line-clamp-2 text-sm leading-5 text-zinc-500">
                            {
                              apartment.description
                            }
                          </p>
                        )}


                        {/* DETAILS */}

                        <div className="mt-5 grid grid-cols-2 gap-2">

                          <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                              Edifício
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-zinc-700">
                              {
                                apartment.building
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                              Apartamento
                            </p>

                            <p className="mt-1 text-xs font-semibold text-zinc-700">
                              {
                                apartment.apartment
                              }
                            </p>
                          </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/apartments/${apartment.id}/edit`,
                              )
                            }
                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              handleDelete(
                                apartment,
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <span className="flex items-center gap-2">
                                <span className="h-3 w-3 animate-spin rounded-full border border-red-300 border-t-red-600" />
                                Excluindo
                              </span>
                            ) : (
                              "Excluir"
                            )}
                          </button>

                        </div>

                      </article>
                    );
                  },
                )}

              </section>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}

export default Apartments;