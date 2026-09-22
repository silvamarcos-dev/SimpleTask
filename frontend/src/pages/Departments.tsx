import { useEffect, useState } from "react";
import axios from "axios";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departments";

import type { Department } from "../types/department";


// =========================================================
// ICONS
// =========================================================

function IconBuilding({ className = "" }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9.5 7.5h1M13.5 7.5h1M9.5 11.5h1M13.5 11.5h1M9.5 15.5h1M13.5 15.5h1" />
    </svg>
  );
}


function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}


function IconEdit({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}


function IconTrash({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}


function IconRefresh({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 11a8.1 8.1 0 0 0-14.7-4.7L3 9" />
      <path d="M3 4v5h5" />
      <path d="M4 13a8.1 8.1 0 0 0 14.7 4.7L21 15" />
      <path d="M21 20v-5h-5" />
    </svg>
  );
}


function IconX({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}


// =========================================================
// HELPERS
// =========================================================

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Ocorreu um erro inesperado.";
  }

  const status = error.response?.status;

  if (status === 403) {
    return "Você não possui permissão para realizar esta operação.";
  }

  if (status === 404) {
    return "Departamento não encontrado.";
  }

  if (status === 409) {
    return (
      error.response?.data?.detail ||
      "Não foi possível concluir a operação porque o departamento possui vínculos."
    );
  }

  if (status === 422) {
    return "Verifique os dados informados.";
  }

  return (
    error.response?.data?.detail ||
    "Não foi possível concluir a operação."
  );
}


// =========================================================
// PAGE
// =========================================================

function Departments() {
  // =======================================================
  // STATE
  // =======================================================

  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [name, setName] = useState("");


  // =======================================================
  // LOAD
  // =======================================================

  async function loadDepartments() {
    setLoading(true);
    setError("");

    try {
      const data = await getDepartments();

      setDepartments(data);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDepartments();
  }, []);


  // =======================================================
  // OPEN CREATE
  // =======================================================

  function handleOpenCreate() {
    setEditingDepartment(null);
    setName("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }


  // =======================================================
  // OPEN EDIT
  // =======================================================

  function handleOpenEdit(department: Department) {
    setEditingDepartment(department);
    setName(department.name);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }


  // =======================================================
  // CLOSE MODAL
  // =======================================================

  function handleCloseModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingDepartment(null);
    setName("");
  }


  // =======================================================
  // SAVE
  // =======================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Informe o nome do departamento.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingDepartment) {
        const updated = await updateDepartment(
          editingDepartment.id,
          {
            name: normalizedName,
          },
        );

        setDepartments((current) =>
          current.map((department) =>
            department.id === updated.id
              ? updated
              : department,
          ),
        );

        setSuccess("Departamento atualizado com sucesso.");
      } else {
        const created = await createDepartment({
          name: normalizedName,
        });

        setDepartments((current) =>
          [...current, created].sort((a, b) =>
            a.name.localeCompare(b.name, "pt-BR"),
          ),
        );

        setSuccess("Departamento criado com sucesso.");
      }

      setModalOpen(false);
      setEditingDepartment(null);
      setName("");
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }


  // =======================================================
  // DELETE
  // =======================================================

  async function handleDelete(
    department: Department,
  ) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o departamento "${department.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(department.id);
    setError("");
    setSuccess("");

    try {
      await deleteDepartment(department.id);

      setDepartments((current) =>
        current.filter(
          (item) => item.id !== department.id,
        ),
      );

      setSuccess(
        "Departamento excluído com sucesso.",
      );
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }


  // =======================================================
  // RENDER
  // =======================================================

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

          <div className="mx-auto max-w-[1380px] px-5 pb-10 pt-7 sm:px-8 lg:px-10 xl:px-12">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Administração
                </p>

                <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[2.7rem]">
                  Departamentos
                </h1>

                <p className="mt-2 max-w-xl text-[15px] leading-6 text-slate-500">
                  Gerencie os departamentos da sua empresa.
                </p>
              </div>


              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={loadDepartments}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconRefresh
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Atualizar
                </button>


                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <IconPlus />

                  Novo departamento
                </button>

              </div>

            </header>


            {/* =================================================
                FEEDBACK
            ================================================= */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {success && !error && (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {success}
              </div>
            )}


            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">

              <div className="flex items-center gap-3">

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <IconBuilding />
                </span>

                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                    Departamentos cadastrados
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-400">
                    {departments.length}{" "}
                    {departments.length === 1
                      ? "departamento"
                      : "departamentos"}
                  </p>
                </div>

              </div>


              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <div className="mt-5 space-y-2">

                  {Array.from(
                    { length: 5 },
                    (_, index) => (
                      <div
                        key={index}
                        className="h-[66px] animate-pulse rounded-xl bg-slate-100"
                      />
                    ),
                  )}

                </div>
              )}


              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                departments.length === 0 && (
                  <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-slate-50/80 px-6 py-14 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <IconBuilding />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                      Nenhum departamento cadastrado
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
                      Crie o primeiro departamento para começar a organizar as tarefas da empresa.
                    </p>

                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <IconPlus />

                      Criar departamento
                    </button>

                  </div>
                )}


              {/* =================================================
                  LIST
              ================================================= */}

              {!loading &&
                departments.length > 0 && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">

                    {departments.map(
                      (
                        department,
                        index,
                      ) => (
                        <div
                          key={department.id}
                          className={`flex min-h-[66px] items-center gap-4 px-4 py-3 transition hover:bg-slate-50 ${
                            index > 0
                              ? "border-t border-slate-100"
                              : ""
                          }`}
                        >

                          {/* ICON */}

                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E2A31] text-white">
                            <IconBuilding />
                          </span>


                          {/* INFO */}

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {department.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{department.id}
                            </p>

                          </div>


                          {/* ACTIONS */}

                          <div className="flex shrink-0 items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenEdit(
                                  department,
                                )
                              }
                              disabled={
                                deletingId ===
                                department.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Editar departamento"
                            >
                              <IconEdit />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  department,
                                )
                              }
                              disabled={
                                deletingId ===
                                department.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Excluir departamento"
                            >
                              {deletingId ===
                              department.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                              ) : (
                                <IconTrash />
                              )}
                            </button>

                          </div>

                        </div>
                      ),
                    )}

                  </div>
                )}

            </section>

          </div>

        </main>

      </div>


      {/* =======================================================
          MODAL
      ======================================================= */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h2
                  id="department-modal-title"
                  className="text-lg font-semibold tracking-[-0.02em] text-slate-900"
                >
                  {editingDepartment
                    ? "Editar departamento"
                    : "Novo departamento"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {editingDepartment
                    ? "Atualize o nome do departamento."
                    : "Cadastre um novo departamento para sua empresa."}
                </p>
              </div>


              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconX />
              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              {error && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}


              <label
                htmlFor="department-name"
                className="block text-sm font-medium text-slate-700"
              >
                Nome do departamento
              </label>


              <input
                id="department-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: Recursos Humanos"
                maxLength={100}
                autoFocus
                disabled={saving}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50"
              />


              <p className="mt-2 text-xs text-slate-400">
                Máximo de 100 caracteres.
              </p>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="mt-6 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={
                    saving ||
                    !name.trim()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {editingDepartment
                    ? "Salvar alterações"
                    : "Criar departamento"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}

export default Departments;