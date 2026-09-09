import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  valueClassName?: string;
  iconClassName?: string;
}

function MetricCard({
  label,
  value,
  description,
  icon,
  valueClassName = "text-zinc-950",
  iconClassName = "bg-zinc-100 text-zinc-700",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {label}
          </p>

          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${valueClassName}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        {description}
      </p>
    </div>
  );
}

export default MetricCard;