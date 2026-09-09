import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTask } from "../services/tasks";
import type { UrgencyLevel } from "../types/taskEnums";


function CreateTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] =
    useState<UrgencyLevel>("media");

  const [scheduledDate, setScheduledDate] =
    useState("");

  const [scheduledTime, setScheduledTime] =
    useState("");

  const [building, setBuilding] =
    useState("");

  const [block, setBlock] =
    useState("");

  const [apartment, setApartment] =
    useState("");

  const [isRecurring, setIsRecurring] =
    useState(false);

  const [recurrenceInterval, setRecurrenceInterval] =
    useState("3");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createTask({
        title,
        description:
          description.trim() || null,

        urgency,

        scheduled_date:
          scheduledDate,

        scheduled_time:
          scheduledTime || null,

        building:
          building.trim() || null,

        block:
          block.trim() || null,

        apartment:
          apartment.trim() || null,

        is_recurring:
          isRecurring,

        recurrence_interval_months:
          isRecurring
            ? Number(recurrenceInterval)
            : null,
      });

      navigate("/dashboard");

    } catch {
      setError(
        "Não foi possível criar a tarefa.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-zinc-900 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="mb-4 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Voltar
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Nova tarefa
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Crie uma nova tarefa para organizar seu dia.
          </p>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* BASIC INFORMATION */}

          <div>

            <h2 className="text-sm font-semibold text-zinc-950">
              Informações da tarefa
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Defina o que precisa ser feito.
            </p>

          </div>


          <div className="mt-5 space-y-5">

            {/* TITLE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Título
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex.: Trocar pilhas"
                required
                maxLength={200}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Adicione detalhes da tarefa..."
                rows={4}
                maxLength={5000}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
              />

            </div>


            {/* URGENCY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Urgência
              </label>

              <div className="grid grid-cols-3 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setUrgency("baixa")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    urgency === "baixa"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  Baixa
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUrgency("media")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    urgency === "media"
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  Média
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUrgency("alta")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    urgency === "alta"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  Alta
                </button>

              </div>

            </div>

          </div>


          {/* DATE */}

          <div className="mt-8 border-t border-zinc-100 pt-8">

            <h2 className="text-sm font-semibold text-zinc-950">
              Agendamento
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Quando essa tarefa deverá ser realizada?
            </p>


            <div className="mt-5 grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Data
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(event) =>
                    setScheduledDate(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Horário
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(event) =>
                    setScheduledTime(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                />

              </div>

            </div>

          </div>


          {/* LOCATION */}

          <div className="mt-8 border-t border-zinc-100 pt-8">

            <h2 className="text-sm font-semibold text-zinc-950">
              Localização
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Informe onde essa tarefa será realizada.
            </p>


            <div className="mt-5 grid gap-5 sm:grid-cols-3">

              {/* BUILDING */}

              <div className="sm:col-span-3">

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Edifício
                </label>

                <input
                  type="text"
                  value={building}
                  onChange={(event) =>
                    setBuilding(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Royal Palace 708"
                  maxLength={150}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                />

              </div>


              {/* BLOCK */}

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Bloco
                </label>

                <input
                  type="text"
                  value={block}
                  onChange={(event) =>
                    setBlock(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: B"
                  maxLength={50}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                />

              </div>


              {/* APARTMENT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Apartamento
                </label>

                <input
                  type="text"
                  value={apartment}
                  onChange={(event) =>
                    setApartment(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: 505"
                  maxLength={50}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                />

              </div>

            </div>

          </div>


          {/* RECURRENCE */}

          <div className="mt-8 border-t border-zinc-100 pt-8">

            <div className="flex items-start gap-3">

              <button
                type="button"
                onClick={() =>
                  setIsRecurring(
                    !isRecurring,
                  )
                }
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  isRecurring
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white"
                }`}
              >

                {isRecurring && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}

              </button>


              <div>

                <button
                  type="button"
                  onClick={() =>
                    setIsRecurring(
                      !isRecurring,
                    )
                  }
                  className="text-left text-sm font-semibold text-zinc-900"
                >
                  Tarefa recorrente
                </button>

                <p className="mt-1 text-xs text-zinc-400">
                  Após ser concluída, a tarefa retornará automaticamente quando o período terminar.
                </p>

              </div>

            </div>


            {isRecurring && (
              <div className="mt-5 max-w-xs">

                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Repetir a cada
                </label>

                <div className="flex items-center gap-3">

                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={recurrenceInterval}
                    onChange={(event) =>
                      setRecurrenceInterval(
                        event.target.value,
                      )
                    }
                    required
                    className="w-24 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
                  />

                  <span className="text-sm text-zinc-500">
                    {Number(
                      recurrenceInterval,
                    ) === 1
                      ? "mês"
                      : "meses"}
                  </span>

                </div>

              </div>
            )}

          </div>


          {/* ACTIONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={loading}
              className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Criando..."
                : "Criar tarefa"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateTask;