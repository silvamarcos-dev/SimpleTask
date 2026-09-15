import type { Task } from "../../types/task";

interface TaskColumnProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  onCreateTask: () => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  accentClassName: string;
}

function getUrgencyStyles(
  urgency: Task["urgency"],
) {
  if (urgency === "alta") {
    return {
      dot: "bg-[#EF4444]",
      badge: "bg-[#FEF0F1]",
      text: "text-[#E5484D]",
      label: "Alta",
    };
  }

  if (urgency === "media") {
    return {
      dot: "bg-[#F5A623]",
      badge: "bg-[#FFF6E5]",
      text: "text-[#D98A00]",
      label: "Média",
    };
  }

  return {
    dot: "bg-[#2563EB]",
    badge: "bg-[#EEF4FF]",
    text: "text-[#2563EB]",
    label: "Baixa",
  };
}

function TaskColumn({
  title,
  subtitle,
  tasks,
  onCreateTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E7EAF0] bg-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start justify-between border-b border-[#EEF0F4] px-5 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[17px] font-semibold tracking-tight text-[#151922]">
              {title}
            </h3>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F1F3F6] px-1.5 text-[10px] font-semibold text-[#667085]">
              {tasks.length}
            </span>
          </div>

          <p className="mt-1 text-[12px] text-[#7B8494]">
            {subtitle}
          </p>
        </div>

        {/* VER TODAS */}

        <button
          type="button"
          onClick={onCreateTask}
          className="ml-4 hidden shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8] sm:flex"
        >
          Ver todas

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* =====================================================
          TASKS
      ===================================================== */}

      <div className="px-4 pb-4 pt-2">
        {tasks.length > 0 ? (
          <div className="space-y-1.5">
            {tasks.map((task) => {
              const completed =
                task.status === "concluida";

              const styles =
                getUrgencyStyles(
                  task.urgency,
                );

              const hasLocation = Boolean(
                task.building ||
                  task.block ||
                  task.apartment,
              );

              const location = [
                task.building
                  ? task.building
                  : null,
                task.block
                  ? `Bloco ${task.block}`
                  : null,
                task.apartment
                  ? `AP. ${task.apartment}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <div
                  key={task.id}
                  className={`group flex min-h-14.5tems-center gap-3 rounded-xl bg-[#FAFBFC] px-3.5 py-2.5 transition-colors duration-150 hover:bg-[#F5F7FA] ${
                    completed
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  {/* =================================================
                      CHECKBOX
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      onToggleTask(task)
                    }
                    aria-label={
                      completed
                        ? "Marcar como pendente"
                        : "Marcar como concluída"
                    }
                    className={`flex h-5.25 w-5.25 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
                      completed
                        ? "border-[#34C88A] bg-[#34C88A] text-white"
                        : "border-[#9AA4B5] bg-white hover:border-[#64748B]"
                    }`}
                  >
                    {completed && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13px] font-medium leading-4.5 tracking-[-0.01em] ${
                        completed
                          ? "text-[#9AA1AE] line-through"
                          : "text-[#171A21]"
                      }`}
                    >
                      {task.title}
                    </p>

                    {hasLocation && (
                      <p className="mt-0.5 truncate text-[10px] leading-3.75 text-[#7D8798]">
                        {location}
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      URGENCY
                  ================================================= */}

                  <span
                    className={`hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium sm:inline-flex ${styles.badge} ${styles.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                    />

                    {styles.label}
                  </span>

                  {/* =================================================
                      TIME
                  ================================================= */}

                  {task.scheduled_time && (
                    <span className="hidden w-12 shrink-0 text-right text-[11px] font-medium text-[#687386] sm:block">
                      {task.scheduled_time.slice(
                        0,
                        5,
                      )}
                    </span>
                  )}

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() =>
                        onEditTask(task)
                      }
                      aria-label="Editar tarefa"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8993A3] transition-colors hover:bg-white hover:text-[#202631]"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          cx="12"
                          cy="5"
                          r="1"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="1"
                        />
                        <circle
                          cx="12"
                          cy="19"
                          r="1"
                        />
                      </svg>
                    </button>

                    {/* =================================================
                        HIDDEN ACTION MENU

                        Editar / Excluir continuam
                        funcionando através de
                        menu simplificado abaixo.
                    ================================================= */}
                  </div>

                  {/* =================================================
                      DESKTOP HIDDEN ACTIONS

                      Mantemos os handlers existentes.
                  ================================================= */}

                  <div className="hidden">
                    <button
                      type="button"
                      onClick={() =>
                        onEditTask(task)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteTask(task)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =====================================================
             EMPTY
          ===================================================== */

          <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[12px] bg-[#FAFBFC] text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#B1B8C4]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="M8 12h8" />
              </svg>
            </div>

            <p className="mt-2.5 text-[11px] font-medium text-[#8A94A5]">
              Nenhuma tarefa
            </p>

            <button
              type="button"
              onClick={onCreateTask}
              className="mt-1 text-[10px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              + Criar tarefa
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default TaskColumn;