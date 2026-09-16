import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createMaintenance } from "../services/maintenance";

import type { FormEvent } from "react";
import type {
  CreateMaintenanceRequest,
  MaintenancePriority,
  MaintenanceStatus,
  ProviderType,
} from "../types/maintenance";

function CreateMaintenance() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateMaintenanceRequest>({
    title: "",
    description: "",
    building: "",
    block: "",
    apartment: "",
    category: "",
    priority: "media",
    status: "pendente",
    provider_type: null,
    provider_name: "",
    provider_phone: "",
    scheduled_date: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof CreateMaintenanceRequest>(
    field: K,
    value: CreateMaintenanceRequest[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =====================================================
     FECHAR
  ===================================================== */

  function handleClose() {
    if (saving) {
      return;
    }

    const hasContent =
      form.title.trim() !== "" ||
      (form.description ?? "").trim() !== "" ||
      (form.building ?? "").trim() !== "" ||
      (form.category ?? "").trim() !== "" ||
      (form.provider_name ?? "").trim() !== "" ||
      (form.scheduled_date ?? "") !== "";

    if (hasContent) {
      const confirmed = window.confirm(
        "As informações preenchidas serão perdidas. Deseja sair?",
      );

      if (!confirmed) {
        return;
      }
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard/maintenance");
  }

  /* =====================================================
     ESC + TRAVA DE SCROLL
  ===================================================== */

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Informe o título da manutenção.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createMaintenance({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        building: form.building?.trim() || null,
        block: form.block?.trim() || null,
        apartment: form.apartment?.trim() || null,
        category: form.category?.trim() || null,
        provider_name: form.provider_name?.trim() || null,
        provider_phone: form.provider_phone?.trim() || null,
        notes: form.notes?.trim() || null,
        scheduled_date: form.scheduled_date || null,
      });

      navigate("/dashboard/maintenance");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const detail = err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Não foi possível cadastrar a manutenção.",
        );
      } else {
        setError("Não foi possível cadastrar a manutenção.");
      }
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     CLASSES COMPARTILHADAS
  ===================================================== */

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

  const selectClass = `${fieldClass} appearance-none pr-10`;

  const labelClass = "mb-2 block text-sm font-medium text-slate-600";

  const sectionTitleClass =
    "text-[15px] font-semibold tracking-[-0.01em] text-slate-900";

  const priorityOptions: {
    value: MaintenancePriority;
    label: string;
    active: string;
  }[] = [
    {
      value: "baixa",
      label: "Baixa",
      active: "border-blue-400 bg-blue-50 text-blue-700",
    },
    {
      value: "media",
      label: "Média",
      active: "border-amber-400 bg-amber-50 text-amber-700",
    },
    {
      value: "alta",
      label: "Alta",
      active: "border-red-400 bg-red-50 text-red-700",
    },
  ];

  const statusOptions: { value: MaintenanceStatus; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "agendada", label: "Agendada" },
    { value: "em_andamento", label: "Em andamento" },
    { value: "concluida", label: "Concluída" },
  ];

  /* =====================================================
     SELECT COM SETA
  ===================================================== */

  function SelectChevron() {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Fechar"
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
      />

      {/* MODAL */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-maintenance-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-h-[88vh] sm:rounded-[24px]"
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h1
              id="create-maintenance-title"
              className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
            >
              Nova manutenção
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Cadastre o serviço e acompanhe sua execução.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
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
          id="create-maintenance-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* INFORMAÇÕES */}

          <section>
            <h2 className={sectionTitleClass}>Informações</h2>

            <div className="mt-4 space-y-5">
              <div>
                <label className={labelClass} htmlFor="title">
                  Título
                </label>

                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Ex.: Trocar lâmpada do banheiro"
                  maxLength={200}
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="description">
                  Descrição
                </label>

                <textarea
                  id="description"
                  value={form.description ?? ""}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Descreva o problema ou o serviço necessário..."
                  rows={4}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="category">
                  Categoria
                </label>

                <input
                  id="category"
                  type="text"
                  value={form.category ?? ""}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Ex.: Elétrica"
                  className={fieldClass}
                />
              </div>

              <div>
                <span className={labelClass}>Prioridade</span>

                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("priority", option.value)}
                      aria-pressed={form.priority === option.value}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        form.priority === option.value
                          ? option.active
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* LOCAL */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className={sectionTitleClass}>Local</h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="building">
                  Edifício
                </label>

                <input
                  id="building"
                  type="text"
                  value={form.building ?? ""}
                  onChange={(event) =>
                    updateField("building", event.target.value)
                  }
                  placeholder="Ex.: Royal Palace"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="block">
                  Bloco
                </label>

                <input
                  id="block"
                  type="text"
                  value={form.block ?? ""}
                  onChange={(event) =>
                    updateField("block", event.target.value)
                  }
                  placeholder="Ex.: B"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="apartment">
                  Apartamento
                </label>

                <input
                  id="apartment"
                  type="text"
                  value={form.apartment ?? ""}
                  onChange={(event) =>
                    updateField("apartment", event.target.value)
                  }
                  placeholder="Ex.: 708"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="scheduled_date">
                  Data prevista
                </label>

                <input
                  id="scheduled_date"
                  type="date"
                  value={form.scheduled_date ?? ""}
                  onChange={(event) =>
                    updateField("scheduled_date", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* PRESTADOR */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className={sectionTitleClass}>Prestador</h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="provider_type">
                  Tipo
                </label>

                <div className="relative">
                  <select
                    id="provider_type"
                    value={form.provider_type ?? ""}
                    onChange={(event) =>
                      updateField(
                        "provider_type",
                        event.target.value
                          ? (event.target.value as ProviderType)
                          : null,
                      )
                    }
                    className={selectClass}
                  >
                    <option value="">Não informado</option>
                    <option value="pessoa">Pessoa</option>
                    <option value="empresa">Empresa</option>
                  </select>

                  <SelectChevron />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="provider_name">
                  Nome
                </label>

                <input
                  id="provider_name"
                  type="text"
                  value={form.provider_name ?? ""}
                  onChange={(event) =>
                    updateField("provider_name", event.target.value)
                  }
                  placeholder="Ex.: Elétrica Silva"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="provider_phone">
                  Telefone
                </label>

                <input
                  id="provider_phone"
                  type="tel"
                  value={form.provider_phone ?? ""}
                  onChange={(event) =>
                    updateField("provider_phone", event.target.value)
                  }
                  placeholder="Ex.: (44) 99999-9999"
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* CONTROLE */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className={sectionTitleClass}>Controle</h2>

            <div className="mt-4 space-y-5">
              <div>
                <label className={labelClass} htmlFor="status">
                  Status
                </label>

                <div className="relative">
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as MaintenanceStatus,
                      )
                    }
                    className={selectClass}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <SelectChevron />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="notes">
                  Observações
                </label>

                <textarea
                  id="notes"
                  value={form.notes ?? ""}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Informações importantes sobre o serviço..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>
          </section>
        </form>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="h-11 rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="create-maintenance-form"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}

            {saving ? "Salvando..." : "Criar manutenção"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateMaintenance;