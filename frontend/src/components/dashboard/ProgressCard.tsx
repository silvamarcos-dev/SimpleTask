interface ProgressCardProps {
  percentage: number;
  completed: number;
  total: number;
}

function ProgressCard({
  percentage,
  completed,
  total,
}: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">
            Progresso de hoje
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            Acompanhe quanto do seu dia já foi concluído.
          </p>
        </div>

        <span className="text-2xl font-bold tracking-tight text-zinc-950">
          {percentage}%
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-500">
          {completed} de {total} concluídas
        </span>

        <span className="text-zinc-400">
          {total === 0
            ? "Nenhuma tarefa hoje"
            : percentage >= 100
              ? "Tudo concluído"
              : "Continue assim"}
        </span>
      </div>
    </div>
  );
}

export default ProgressCard;