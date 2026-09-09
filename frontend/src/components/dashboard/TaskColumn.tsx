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

function getUrgencyLabel(
  urgency: Task["urgency"],
): string {
  if (urgency === "alta") {
    return "Alta urgência";
  }

  if (urgency === "media") {
    return "Média urgência";
  }

  return "Baixa urgência";
}

function TaskColumn({
  title,
  subtitle,
  tasks,
  onCreateTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  accentClassName,
}: TaskColumnProps) {
  const urgencyOrder: Task["urgency"][] = [
    "alta",
    "media",
    "baixa",
  ];

  return (
    <div
      className={`flex min-h-[560px] min-w-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 border-t-4 bg-zinc-50 ${accentClassName}`}
    >
      {/* HEADER */}

      <div className="border-b border-zinc-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">
              {title}
            </h3>

            <p className="mt-1 text-xs text-zinc-400">
              {subtitle}
            </p>
          </div>

          <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-zinc-100 px-2 text-xs font-bold text-zinc-600">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* TASKS */}

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {urgencyOrder.map((urgency) => {
          const urgencyTasks = tasks.filter(
            (task) =>
              task.urgency === urgency,
          );

          const urgencyColor =
            urgency === "alta"
              ? "bg-red-500"
              : urgency === "media"
                ? "bg-amber-400"
                : "bg-blue-500";

          return (
            <div key={urgency}>
              {/* URGENCY */}

              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${urgencyColor}`}
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {getUrgencyLabel(urgency)}
                </span>

                <span className="text-[10px] font-medium text-zinc-300">
                  {urgencyTasks.length}
                </span>
              </div>

              {/* TASK CARDS */}

              <div className="space-y-2">
                {urgencyTasks.map((task) => {
                  const completed =
                    task.status === "concluida";

                  const hasLocation =
                    Boolean(
                      task.building ||
                        task.apartment ||
                        task.block,
                    );

                  return (
                    <div
                      key={task.id}
                      className={`group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md ${
                        completed
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* STATUS */}

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
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            completed
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-zinc-300 bg-white hover:border-zinc-500"
                          }`}
                        >
                          {completed && (
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

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          {/* TITLE */}

                          <p
                            className={`text-sm font-medium leading-5 ${
                              completed
                                ? "text-zinc-400 line-through"
                                : "text-zinc-800"
                            }`}
                          >
                            {task.title}
                          </p>

                          {/* DESCRIPTION */}

                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                              {task.description}
                            </p>
                          )}

                          {/* LOCATION */}

                          {hasLocation && (
                            <div className="mt-3">
                              <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[10px] font-medium text-zinc-600">
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="shrink-0"
                                >
                                  <path d="M3 21h18" />

                                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />

                                  <path d="M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2" />
                                </svg>

                                <span className="truncate">
                                  {[
                                    task.building
                                      ? `Edifício ${task.building}`
                                      : null,

                                    task.apartment
                                      ? `AP. ${task.apartment}`
                                      : null,

                                    task.block
                                      ? `Bloco ${task.block}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </span>
                              </span>
                            </div>
                          )}

                          {/* TIME */}

                          {task.scheduled_time && (
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                />

                                <path d="M12 7v5l3 2" />
                              </svg>

                              {task.scheduled_time.slice(
                                0,
                                5,
                              )}
                            </div>
                          )}

                          {/* ACTIONS */}

                          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
                            <button
                              type="button"
                              onClick={() =>
                                onEditTask(task)
                              }
                              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M12 20h9" />

                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>

                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onDeleteTask(task)
                              }
                              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M3 6h18" />

                                <path d="M8 6V4h8v2" />

                                <path d="M19 6l-1 14H6L5 6" />

                                <path d="M10 11v5M14 11v5" />
                              </svg>

                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* EMPTY URGENCY */}

                {urgencyTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-zinc-200 bg-white/50 px-3 py-3 text-center">
                    <span className="text-[10px] text-zinc-300">
                      Nenhuma tarefa
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* EMPTY COLUMN */}

        {tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-300 shadow-sm">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M9 11l3 3L22 4" />

                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>

            <p className="mt-3 text-xs font-medium text-zinc-500">
              Nenhuma tarefa
            </p>

            <button
              type="button"
              onClick={onCreateTask}
              className="mt-3 text-[11px] font-semibold text-zinc-700 transition hover:text-zinc-950"
            >
              + Criar tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskColumn;