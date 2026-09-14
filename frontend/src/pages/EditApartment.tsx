import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

import {
  getApartment,
  updateApartment,
} from "../services/apartment";

import type { ApartmentStatus } from "../types/apartment";

function EditApartment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const apartmentId = Number(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");
  const [status, setStatus] =
    useState<ApartmentStatus>("ativo");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD APARTMENT
  ======================================================= */

  useEffect(() => {
    async function loadApartment() {
      if (!Number.isInteger(apartmentId) || apartmentId <= 0) {
        setError("Apartamento inválido.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const data = await getApartment(apartmentId);

        setTitle(data.title);
        setDescription(data.description ?? "");
        setBuilding(data.building);
        setBlock(data.block ?? "");
        setApartment(data.apartment);
        setStatus(data.status);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          navigate("/login", { replace: true });
          return;
        }

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("Apartamento não encontrado.");
          return;
        }

        setError(
          "Não foi possível carregar o apartamento.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadApartment();
  }, [apartmentId, navigate]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
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

    if (!Number.isInteger(apartmentId) || apartmentId <= 0) {
      setError("Apartamento inválido.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateApartment(apartmentId, {
        title: title.trim(),
        description: description.trim() || null,
        building: building.trim(),
        block: block.trim() || null,
        apartment: apartment.trim(),
        status,
      });

      navigate("/apartments");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        navigate("/login", { replace: true });
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        setError("Apartamento não encontrado.");
        return;
      }

      setError(
        "Não foi possível atualizar o apartamento.",
      );
    } finally {
      setSaving(false);
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
            Carregando apartamento...
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

        <DashboardSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-275 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">

            {/* HEADER */}

            <header className="mb-8">
              <button
                type="button"
                onClick={() => navigate("/apartments")}
                className="mb-5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
              >
                ← Voltar para apartamentos
              </button>

              <p className="text-sm font-medium text-zinc-400">
                Gestão de imóveis
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Editar apartamento
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Atualize as informações deste imóvel.
              </p>
            </header>

            {/* ERROR */}

            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => navigate("/apartments")}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Voltar
                </button>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="p-5 sm:p-7">

                <div className="mb-7">
                  <h2 className="text-base font-bold text-zinc-950">
                    Informações do apartamento
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Altere os dados necessários e salve as mudanças.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* TÍTULO */}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Título
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      placeholder="Ex.: Royal Palace AP. 708"
                      maxLength={200}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </div>

                  {/* EDIFÍCIO */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Edifício
                    </label>

                    <input
                      type="text"
                      value={building}
                      onChange={(event) =>
                        setBuilding(event.target.value)
                      }
                      placeholder="Ex.: Royal Palace"
                      maxLength={150}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </div>

                  {/* BLOCO */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Bloco
                      <span className="ml-1 font-normal text-zinc-400">
                        (opcional)
                      </span>
                    </label>

                    <input
                      type="text"
                      value={block}
                      onChange={(event) =>
                        setBlock(event.target.value)
                      }
                      placeholder="Ex.: B"
                      maxLength={50}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </div>

                  {/* APARTAMENTO */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Apartamento
                    </label>

                    <input
                      type="text"
                      value={apartment}
                      onChange={(event) =>
                        setApartment(event.target.value)
                      }
                      placeholder="Ex.: 708"
                      maxLength={50}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </div>

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target.value as ApartmentStatus,
                        )
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    >
                      <option value="ativo">
                        Ativo
                      </option>

                      <option value="manutencao">
                        Manutenção
                      </option>

                      <option value="inativo">
                        Inativo
                      </option>
                    </select>
                  </div>

                  {/* DESCRIÇÃO */}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-zinc-700">
                      Descrição
                      <span className="ml-1 font-normal text-zinc-400">
                        (opcional)
                      </span>
                    </label>

                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Adicione alguma informação relevante sobre o apartamento..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </div>

                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 bg-zinc-50/70 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">

                <button
                  type="button"
                  onClick={() => navigate("/apartments")}
                  disabled={saving}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                  )}

                  {saving
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>

              </div>
            </form>

          </div>
        </main>

      </div>
    </div>
  );
}

export default EditApartment;