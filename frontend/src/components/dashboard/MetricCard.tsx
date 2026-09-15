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
    <div className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-6">
      
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-semibold tracking-wide text-zinc-400">
            {label}
          </p>

          <p
            className={`mt-3 text-[2rem] font-bold leading-none tracking-[-0.04em] sm:text-[2.15rem] ${valueClassName}`}
          >
            {value}
          </p>

        </div>


        {/* ICON */}

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
        >
          {icon}
        </div>

      </div>


      {/* DESCRIPTION */}

      <p className="mt-5 text-xs leading-5 text-zinc-400">
        {description}
      </p>

    </div>
  );
}

export default MetricCard;