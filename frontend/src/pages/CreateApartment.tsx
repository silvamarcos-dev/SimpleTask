import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createApartment } from "../services/apartment";

import type { ApartmentStatus } from "../types/apartment";

function CreateApartment() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");
  const [status, setStatus] = useState<ApartmentStatus>("ativo");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     FECHAR
  ===================================================== */

  function handleClose() {
    if (saving) {
      return;
    }

    const hasContent =
      title.trim() !== "" ||
      building.trim() !== "" ||
      apartment.trim() !== "" ||
      block.trim() !== "" ||
      description.trim() !== "";

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

    navigate("/apartments");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Informe um título para o apartamento.");
      return;
    }

    if (!building.trim()) {
      setError("Informe o edifício.");
      return;
    }

    if (!apartment.trim()) {
      setError("Informe o número do apartamento.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createApartment({
        title: title.trim(),
        description: description.trim() || null,
        building: building.trim(),
        block: block.trim() || null,
        apartment: apartment.trim(),
        status,
      });

      navigate("/apartments");
    } catch (submitError) {
      if (
        axios.isAxiosError(submitError) &&
        submitError.response?.status === 401
      ) {
        navigate("/login", { replace: true });
        return;
      }

      setError("Não foi possível cadastrar o apartamento.");
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     CLASSES COMPARTILHADAS
  ===================================================== */

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

  const labelClass = "mb-2 block text-sm font-medium text-slate-600";

  const optionalClass = "ml-1 font-normal text-slate-400";

  const statusOptions: {
    value: ApartmentStatus;
    label: string;
    active: string;
  }[] = [
    {
      value: "ativo",
      label: "Ativo",
      active: "border-emerald-400 bg-emerald-50 text-emerald-700",
    },
    {
      value: "manutencao",
      label: "Manutenção",
      active: "border-amber-400 bg-amber-50 text-amber-700",
    },
    {
      value: "inativo",
      label: "Inativo",
      active: "border-slate-400 bg-slate-100 text-slate-700",
    },
  ];

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
        aria-labelledby="create-apartment-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-h-[88vh] sm:rounded-[24px]"
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h1
              id="create-apartment-title"
              className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
            >
              Novo apartamento
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Cadastre um imóvel para vincular tarefas e manutenções.
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
          id="create-apartment-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* IDENTIFICAÇÃO */}

          <section>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Identificação
            </h2>

            <div className="mt-4 space-y-5">
              <div>
                <label className={labelClass} htmlFor="apartment-title">
                  Título
                </label>

                <input
                  id="apartment-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Royal Palace AP 708"
                  maxLength={200}
                  className={fieldClass}
                />
              </div>

              <div>
                <span className={labelClass}>Status</span>

                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      aria-pressed={status === option.value}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                        status === option.value
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

          {/* ENDEREÇO */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
              Endereço
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="apartment-building">
                  Edifício
                </label>

                <input
                  id="apartment-building"
                  type="text"
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="Ex.: Royal Palace"
                  maxLength={150}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="apartment-block">
                  Bloco
                  <span className={optionalClass}>(opcional)</span>
                </label>

                <input
                  id="apartment-block"
                  type="text"
                  value={block}
                  onChange={(event) => setBlock(event.target.value)}
                  placeholder="Ex.: B"
                  maxLength={50}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="apartment-number">
                  Apartamento
                </label>

                <input
                  id="apartment-number"
                  type="text"
                  value={apartment}
                  onChange={(event) => setApartment(event.target.value)}
                  placeholder="Ex.: 708"
                  maxLength={50}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* DESCRIÇÃO */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <label className={labelClass} htmlFor="apartment-description">
              Descrição
              <span className={optionalClass}>(opcional)</span>
            </label>

            <textarea
              id="apartment-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Chaves na portaria, morador com horário restrito, detalhes de acesso..."
              rows={4}
              className={`${fieldClass} resize-none leading-6`}
            />
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
            form="create-apartment-form"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}

            {saving ? "Salvando..." : "Cadastrar apartamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateApartment;