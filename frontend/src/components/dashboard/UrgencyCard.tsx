interface UrgencyCardProps {
  baixa: number;
  media: number;
  alta: number;
}

interface UrgencyItemProps {
  label: string;
  value: number;
  dotClassName: string;
}

function UrgencyItem({
  label,
  value,
  dotClassName,
}: UrgencyItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClassName}`}
        />

        <span className="text-sm font-medium text-zinc-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-zinc-900">
        {value}
      </span>
    </div>
  );
}

function UrgencyCard({
  baixa,
  media,
  alta,
}: UrgencyCardProps) {
  const total = baixa + media + alta;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-zinc-950">
          Por nível de urgência
        </h2>

        <p className="mt-1 text-xs text-zinc-400">
          Distribuição das tarefas de hoje.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <UrgencyItem
          label="Alta urgência"
          value={alta}
          dotClassName="bg-red-500"
        />

        <UrgencyItem
          label="Média urgência"
          value={media}
          dotClassName="bg-amber-400"
        />

        <UrgencyItem
          label="Baixa urgência"
          value={baixa}
          dotClassName="bg-blue-500"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <span className="text-xs text-zinc-400">
          Total
        </span>

        <span className="text-sm font-bold text-zinc-900">
          {total}
        </span>
      </div>
    </div>
  );
}

export default UrgencyCard;