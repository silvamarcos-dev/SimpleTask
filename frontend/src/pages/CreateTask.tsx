import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTask } from "../services/tasks";
import { getDepartments } from "../services/departments";

import type { RecurrenceType } from "../types/task";
import type { UrgencyLevel } from "../types/taskEnums";
import type { Department } from "../types/department";

function CreateTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] =
    useState<UrgencyLevel>("media");

  /* =====================================================
     DEPARTAMENTO
  ===================================================== */

  const [departmentId, setDepartmentId] =
    useState<number | "">("");

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(true);

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

  const [recurrenceType, setRecurrenceType] =
    useState<RecurrenceType>("semanal");

  const [recurrenceInterval, setRecurrenceInterval] =
    useState("3");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     CARREGAR DEPARTAMENTOS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadDepartments() {
      try {
        setLoadingDepartments(true);

        const data = await getDepartments();

        if (mounted) {
          setDepartments(data);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "Não foi possível carregar os departamentos.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingDepartments(false);
        }
      }
    }

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     FECHAR
  ===================================================== */

  function handleClose() {
    if (loading) {
      return;
    }

    const hasContent =
      title.trim() !== "" ||
      description.trim() !== "" ||
      scheduledDate !== "" ||
      building.trim() !== "" ||
      departmentId !== "";

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

    navigate("/dashboard");
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

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  });

  /* =====================================================
     RECORRÊNCIA
  ===================================================== */

  function getRecurrenceUnit() {
    const interval = Number(
      recurrenceInterval,
    );

    if (recurrenceType === "diaria") {
      return interval === 1
        ? "dia"
        : "dias";
    }

    if (recurrenceType === "semanal") {
      return interval === 1
        ? "semana"
        : "semanas";
    }

    return interval === 1
      ? "mês"
      : "meses";
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Informe um título para a tarefa.",
      );
      return;
    }

    if (!departmentId) {
      setError(
        "Selecione o departamento da tarefa.",
      );
      return;
    }

    if (!scheduledDate) {
      setError(
        "Informe a data da tarefa.",
      );
      return;
    }

    if (isRecurring) {
      const interval = Number(
        recurrenceInterval,
      );

      if (
        !Number.isInteger(interval) ||
        interval < 1
      ) {
        setError(
          "O intervalo de recorrência deve ser maior que zero.",
        );
        return;
      }

      if (interval > 120) {
        setError(
          "O intervalo de recorrência não pode ser maior que 120.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      await createTask({
        title: title.trim(),

        description:
          description.trim() || null,

        urgency,

        department_id:
          Number(departmentId),

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

        recurrence_type:
          isRecurring
            ? recurrenceType
            : "nenhuma",

        recurrence_interval:
          isRecurring
            ? Number(recurrenceInterval)
            : null,
      });

      navigate("/tasks");
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível criar a tarefa.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     CLASSES COMPARTILHADAS
  ===================================================== */

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-600";

  const sectionTitleClass =
    "text-[15px] font-semibold tracking-[-0.01em] text-slate-900";

  const urgencyOptions: {
    value: UrgencyLevel;
    label: string;
    active: string;
  }[] = [
    {
      value: "baixa",
      label: "Baixa",
      active:
        "border-blue-400 bg-blue-50 text-blue-700",
    },
    {
      value: "media",
      label: "Média",
      active:
        "border-amber-400 bg-amber-50 text-amber-700",
    },
    {
      value: "alta",
      label: "Alta",
      active:
        "border-red-400 bg-red-50 text-red-700",
    },
  ];

  const recurrenceOptions: {
    value: RecurrenceType;
    label: string;
  }[] = [
    {
      value: "diaria",
      label: "Diária",
    },
    {
      value: "semanal",
      label: "Semanal",
    },
    {
      value: "mensal",
      label: "Mensal",
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
        aria-labelledby="create-task-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:max-h-[88vh] sm:rounded-3xl"
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h1
              id="create-task-title"
              className="text-xl font-semibold tracking-[-0.02em] text-slate-900"
            >
              Nova tarefa
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Defina o que precisa ser feito e quando.
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
          id="create-task-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* INFORMAÇÕES */}

          <section>
            <h2 className={sectionTitleClass}>
              Informações da tarefa
            </h2>

            <div className="mt-4 space-y-5">
              {/* TÍTULO */}

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-title"
                >
                  Título
                </label>

                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Trocar as lâmpadas do corredor"
                  required
                  maxLength={200}
                  className={fieldClass}
                />
              </div>

              {/* DESCRIÇÃO */}

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-description"
                >
                  Descrição
                </label>

                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Adicione detalhes que ajudem na execução..."
                  rows={4}
                  maxLength={5000}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              {/* DEPARTAMENTO */}

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-department"
                >
                  Departamento
                </label>

                <select
                  id="task-department"
                  value={departmentId}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setDepartmentId(
                      value === ""
                        ? ""
                        : Number(value),
                    );
                  }}
                  disabled={
                    loadingDepartments ||
                    loading
                  }
                  required
                  className={fieldClass}
                >
                  <option value="">
                    {loadingDepartments
                      ? "Carregando departamentos..."
                      : "Selecione o departamento"}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ),
                  )}
                </select>

                {!loadingDepartments &&
                  departments.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Nenhum departamento disponível.
                    </p>
                  )}
              </div>

              {/* URGÊNCIA */}

              <div>
                <span className={labelClass}>
                  Urgência
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {urgencyOptions.map(
                    (option) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setUrgency(
                            option.value,
                          )
                        }
                        aria-pressed={
                          urgency ===
                          option.value
                        }
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                          urgency ===
                          option.value
                            ? option.active
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {
                          option.label
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* AGENDAMENTO */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className={sectionTitleClass}>
              Agendamento
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  className={labelClass}
                  htmlFor="task-date"
                >
                  Data
                </label>

                <input
                  id="task-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(event) =>
                    setScheduledDate(
                      event.target.value,
                    )
                  }
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-time"
                >
                  Horário
                </label>

                <input
                  id="task-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(event) =>
                    setScheduledTime(
                      event.target.value,
                    )
                  }
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* LOCALIZAÇÃO */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <h2 className={sectionTitleClass}>
              Localização
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className={labelClass}
                  htmlFor="task-building"
                >
                  Edifício
                </label>

                <input
                  id="task-building"
                  type="text"
                  value={building}
                  onChange={(event) =>
                    setBuilding(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Royal Palace"
                  maxLength={150}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-block"
                >
                  Bloco
                </label>

                <input
                  id="task-block"
                  type="text"
                  value={block}
                  onChange={(event) =>
                    setBlock(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: B"
                  maxLength={50}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  className={labelClass}
                  htmlFor="task-apartment"
                >
                  Apartamento
                </label>

                <input
                  id="task-apartment"
                  type="text"
                  value={apartment}
                  onChange={(event) =>
                    setApartment(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: 505"
                  maxLength={50}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* RECORRÊNCIA */}

          <section className="mt-7 border-t border-slate-100 pt-7">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  setIsRecurring(
                    !isRecurring,
                  )
                }
                role="switch"
                aria-checked={
                  isRecurring
                }
                aria-label="Tarefa recorrente"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  isRecurring
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white hover:border-slate-500"
                }`}
              >
                {isRecurring && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                  className="text-left text-[15px] font-semibold text-slate-900"
                >
                  Tarefa recorrente
                </button>

                <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                  Ao concluir, a tarefa volta automaticamente quando o período
                  terminar.
                </p>
              </div>
            </div>

            {isRecurring && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5">
                <span className={labelClass}>
                  Frequência
                </span>

                <div className="grid gap-2 sm:grid-cols-3">
                  {recurrenceOptions.map(
                    (option) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setRecurrenceType(
                            option.value,
                          )
                        }
                        aria-pressed={
                          recurrenceType ===
                          option.value
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                          recurrenceType ===
                          option.value
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {
                          option.label
                        }
                      </button>
                    ),
                  )}
                </div>

                <div className="mt-5">
                  <label
                    className={labelClass}
                    htmlFor="task-interval"
                  >
                    Repetir a cada
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      id="task-interval"
                      type="number"
                      min="1"
                      max="120"
                      value={
                        recurrenceInterval
                      }
                      onChange={(event) =>
                        setRecurrenceInterval(
                          event.target.value,
                        )
                      }
                      required
                      className={`${fieldClass} w-24`}
                    />

                    <span className="text-sm text-slate-500">
                      {getRecurrenceUnit()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </form>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="h-11 rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="create-task-form"
            disabled={
              loading ||
              loadingDepartments ||
              departments.length === 0
            }
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Criando..."
              : "Criar tarefa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTask;