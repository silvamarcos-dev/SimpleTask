import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../../lib/authStorage";

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/maintenance";

  const isOverview = location.pathname === "/dashboard";
  const isMaintenance = location.pathname === "/dashboard/maintenance";
  const isCalendar = location.pathname === "/calendar";
  const isNewTask = location.pathname === "/tasks/new";

  const [dashboardExpanded, setDashboardExpanded] =
    useState(isDashboard);

  function handleDashboardClick() {
    setDashboardExpanded(true);
    navigate("/dashboard");
  }

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-lg font-bold tracking-tight text-zinc-950"
        >
          Simple Task
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {/* Dashboard */}
        <div>
          <div
            className={`flex items-center rounded-lg transition ${
              isDashboard
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            }`}
          >
            <button
              type="button"
              onClick={handleDashboardClick}
              className="flex flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm font-medium"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>

              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setDashboardExpanded((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              aria-label={
                dashboardExpanded
                  ? "Recolher Dashboard"
                  : "Expandir Dashboard"
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${
                  dashboardExpanded ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Submenu */}
          {dashboardExpanded && (
            <div className="ml-6 mt-1 space-y-1 border-l border-zinc-200 pl-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isOverview
                    ? "bg-zinc-100 font-semibold text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 12 12 3l9 9" />
                  <path d="M5 10v10h14V10" />
                </svg>

                Visão geral
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/maintenance")}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isMaintenance
                    ? "bg-zinc-100 font-semibold text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17v3h3l5.6-5.6a4 4 0 0 0 5.1-5.1l-2.2 2.2-2.8-.8-.8-2.8z" />
                  <path d="m16 8 2-2" />
                </svg>

                Manutenções
              </button>
            </div>
          )}
        </div>

        {/* Calendário */}
        <button
          type="button"
          onClick={() => navigate("/calendar")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
            isCalendar
              ? "bg-zinc-100 text-zinc-950"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>

          Calendário
        </button>

        {/* Nova tarefa */}
        <button
          type="button"
          onClick={() => navigate("/tasks/new")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
            isNewTask
              ? "bg-zinc-100 text-zinc-950"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Nova tarefa
        </button>
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
          </svg>

          Sair
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;