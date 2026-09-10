import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMaintenance,
  updateMaintenance,
} from "../services/maintenance";

import type { FormEvent } from "react";
import type {
  MaintenancePriority,
  MaintenanceStatus,
  ProviderType,
  UpdateMaintenanceRequest,
} from "../types/maintenance";

function EditMaintenance() {
  const navigate = useNavigate();
  const { maintenanceId } = useParams<{
    maintenanceId: string;
  }>();

  const [form, setForm] =
    useState<UpdateMaintenanceRequest>({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMaintenance() {
      if (!maintenanceId) {
        setError("Manutenção não encontrada.");
        setLoading(false);
        return;
      }

      try {
        const maintenance = await getMaintenance(
          Number(maintenanceId),
        );

        setForm({
          title: maintenance.title,
          description: maintenance.description ?? "",
          building: maintenance.building ?? "",
          block: maintenance.block ?? "",
          apartment: maintenance.apartment ?? "",
          category: maintenance.category ?? "",
          priority: maintenance.priority,
          status: maintenance.status,
          provider_type: maintenance.provider_type,
          provider_name: maintenance.provider_name ?? "",
          provider_phone:
            maintenance.provider_phone ?? "",
          scheduled_date:
            maintenance.scheduled_date ?? "",
          notes: maintenance.notes ?? "",
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            navigate("/login", {
              replace: true,
            });
            return;
          }

          if (err.response?.status === 404) {
            setError(
              "A manutenção não foi encontrada.",
            );
            return;
          }

          const detail = err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else {
            setError(
              "Não foi possível carregar a manutenção.",
            );
          }
        } else {
          setError(
            "Não foi possível carregar a manutenção.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadMaintenance();
  }, [maintenanceId, navigate]);

  function updateField<K extends keyof UpdateMaintenanceRequest>(
    field: K,
    value: UpdateMaintenanceRequest[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!maintenanceId) {
      setError("Manutenção não encontrada.");
      return;
    }

    if (!form.title?.trim()) {
      setError("Informe o título da manutenção.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateMaintenance(
        Number(maintenanceId),
        {
          ...form,
          title: form.title.trim(),
          description:
            form.description?.trim() || null,
          building:
            form.building?.trim() || null,
          block:
            form.block?.trim() || null,
          apartment:
            form.apartment?.trim() || null,
          category:
            form.category?.trim() || null,
          provider_name:
            form.provider_name?.trim() || null,
          provider_phone:
            form.provider_phone?.trim() || null,
          notes:
            form.notes?.trim() || null,
          scheduled_date:
            form.scheduled_date || null,
        },
      );

      navigate("/dashboard/maintenance");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        if (err.response?.status === 404) {
          setError(
            "A manutenção não foi encontrada.",
          );
          return;
        }

        const detail = err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError(
            "Não foi possível atualizar a manutenção.",
          );
        }
      } else {
        setError(
          "Não foi possível atualizar a manutenção.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-500">
              Carregando manutenção...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Cabeçalho */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/maintenance")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>

            Voltar para manutenções
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Editar manutenção
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Atualize as informações e acompanhe o estado
            da manutenção.
          </p>
        </div>

        {/* Formulário */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
        >
          {/* Informações */}

          <section className="p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-950">
                Informações
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Atualize o que precisa ser feito.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Título
                </label>

                <input
                  id="title"
                  type="text"
                  value={form.title ?? ""}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Trocar lâmpada do banheiro"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Descrição
                </label>

                <textarea
                  id="description"
                  value={form.description ?? ""}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Descreva o problema ou serviço necessário..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Categoria
                  </label>

                  <input
                    id="category"
                    type="text"
                    value={form.category ?? ""}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Elétrica"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Prioridade
                  </label>

                  <select
                    id="priority"
                    value={form.priority ?? "media"}
                    onChange={(event) =>
                      updateField(
                        "priority",
                        event.target
                          .value as MaintenancePriority,
                      )
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  >
                    <option value="baixa">
                      Baixa
                    </option>

                    <option value="media">
                      Média
                    </option>

                    <option value="alta">
                      Alta
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Local */}

          <section className="border-t border-zinc-100 p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-950">
                Local
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Informe onde a manutenção será realizada.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label
                  htmlFor="building"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Edifício
                </label>

                <input
                  id="building"
                  type="text"
                  value={form.building ?? ""}
                  onChange={(event) =>
                    updateField(
                      "building",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Royal Palace"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="block"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Bloco
                </label>

                <input
                  id="block"
                  type="text"
                  value={form.block ?? ""}
                  onChange={(event) =>
                    updateField(
                      "block",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: B"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="apartment"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Apartamento
                </label>

                <input
                  id="apartment"
                  type="text"
                  value={form.apartment ?? ""}
                  onChange={(event) =>
                    updateField(
                      "apartment",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: 708"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="scheduled_date"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Data prevista
                </label>

                <input
                  id="scheduled_date"
                  type="date"
                  value={form.scheduled_date ?? ""}
                  onChange={(event) =>
                    updateField(
                      "scheduled_date",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>
            </div>
          </section>

          {/* Prestador */}

          <section className="border-t border-zinc-100 p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-950">
                Prestador
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Atualize quem ficará responsável pelo
                serviço.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="provider_type"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Tipo
                </label>

                <select
                  id="provider_type"
                  value={form.provider_type ?? ""}
                  onChange={(event) =>
                    updateField(
                      "provider_type",
                      event.target.value
                        ? (event.target
                            .value as ProviderType)
                        : null,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                >
                  <option value="">
                    Não informado
                  </option>

                  <option value="pessoa">
                    Pessoa
                  </option>

                  <option value="empresa">
                    Empresa
                  </option>
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="provider_name"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Nome
                  </label>

                  <input
                    id="provider_name"
                    type="text"
                    value={form.provider_name ?? ""}
                    onChange={(event) =>
                      updateField(
                        "provider_name",
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Elétrica Silva"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="provider_phone"
                    className="mb-2 block text-sm font-medium text-zinc-700"
                  >
                    Telefone
                  </label>

                  <input
                    id="provider_phone"
                    type="tel"
                    value={form.provider_phone ?? ""}
                    onChange={(event) =>
                      updateField(
                        "provider_phone",
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: (44) 99999-9999"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Controle */}

          <section className="border-t border-zinc-100 p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-950">
                Controle
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Defina o estado atual da manutenção e
                adicione observações.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={form.status ?? "pendente"}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target
                        .value as MaintenanceStatus,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                >
                  <option value="pendente">
                    Pendente
                  </option>

                  <option value="em_andamento">
                    Em andamento
                  </option>

                  <option value="agendada">
                    Agendada
                  </option>

                  <option value="concluida">
                    Concluída
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Observações
                </label>

                <textarea
                  id="notes"
                  value={form.notes ?? ""}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value,
                    )
                  }
                  placeholder="Adicione informações importantes..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>
            </div>
          </section>

          {/* Erro */}

          {error && (
            <div className="border-t border-zinc-100 px-6 py-4 sm:px-7">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {/* Ações */}

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 bg-zinc-50/70 p-6 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/maintenance")
              }
              disabled={saving}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditMaintenance;