import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { removeToken } from "../../lib/authStorage";

interface DashboardSidebarProps {
  userName: string;
  userEmail: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

/* =========================================================
   SIDEBAR
========================================================= */

function DashboardSidebar({
  userName,
  userEmail,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     ACTIVE ROUTES
  ======================================================= */

  const isDashboard =
    location.pathname ===
    "/dashboard";

  const isCalendar =
    location.pathname ===
    "/calendar";

  const isNewTask =
    location.pathname ===
      "/tasks/new" ||
    location.pathname.startsWith(
      "/tasks/",
    );

  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    removeToken();

    navigate("/login", {
      replace: true,
    });
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="flex h-20 items-center border-b border-zinc-100 px-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-950">
            Simple Task
          </h1>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
            Organização simples
          </p>
        </div>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 px-3 py-5">

        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Menu
        </p>

        <div className="mt-3 space-y-1">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isDashboard
                ? "bg-zinc-950 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
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
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
              />

              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
              />

              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
              />

              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
            </svg>

            Dashboard
          </button>

          {/* =================================================
              CALENDAR
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/calendar")
            }
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isCalendar
                ? "bg-zinc-950 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
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
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
              />

              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>

            Calendário
          </button>

          {/* =================================================
              NEW TASK
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/tasks/new",
              )
            }
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isNewTask
                ? "bg-zinc-950 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
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
              <path d="M12 5v14M5 12h14" />
            </svg>

            Nova tarefa
          </button>

        </div>
      </nav>

      {/* =================================================
          USER
      ================================================= */}

      <div className="border-t border-zinc-100 p-4">

        <div className="flex items-center gap-3">

          {/* AVATAR */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white">
            {getInitials(
              userName,
            )}
          </div>

          {/* USER INFO */}

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-zinc-800">
              {userName}
            </p>

            <p className="truncate text-[11px] text-zinc-400">
              {userEmail}
            </p>

          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            title="Sair"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
              <path d="M13 21h6a2 2 0 0 0 2-2" />
            </svg>
          </button>

        </div>
      </div>

    </aside>
  );
}

export default DashboardSidebar;