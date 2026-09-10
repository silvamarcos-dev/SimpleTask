import { useEffect, useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { removeToken } from "../../lib/authStorage";

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard =
    location.pathname === "/dashboard" ||
    location.pathname ===
      "/dashboard/maintenance";

  const isOverview =
    location.pathname === "/dashboard";

  const isMaintenance =
    location.pathname ===
    "/dashboard/maintenance";

  const isCalendar =
    location.pathname === "/calendar";

  const isNewTask =
    location.pathname === "/tasks/new";

  const [dashboardExpanded, setDashboardExpanded] =
    useState(isDashboard);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
   * Controla o scroll da página enquanto
   * o menu mobile estiver aberto.
   *
   * Este efeito é válido porque estamos
   * sincronizando com uma API externa do navegador.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleDashboardClick() {
    setDashboardExpanded(true);
    navigate("/dashboard");
  }

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function navigateMobile(path: string) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition hover:bg-zinc-100"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          className="text-base font-bold tracking-tight text-zinc-950"
        >
          Simple Task
        </button>

        <div className="h-10 w-10" />
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72.5 max-w-[85vw] flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* MOBILE SIDEBAR HEADER */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
          <button
            type="button"
            onClick={() =>
              navigateMobile("/dashboard")
            }
            className="text-lg font-bold tracking-tight text-zinc-950"
          >
            Simple Task
          </button>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Dashboard */}

          <div>
            <div
              className={`flex items-center rounded-lg transition ${
                isDashboard
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-600"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  navigateMobile(
                    "/dashboard",
                  )
                }
                className="flex flex-1 items-center gap-3 px-3 py-3 text-left text-sm font-medium"
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

              <button
                type="button"
                onClick={() =>
                  setDashboardExpanded(
                    (current) =>
                      !current,
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-lg"
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
                    dashboardExpanded
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Dashboard submenu */}

            {dashboardExpanded && (
              <div className="ml-6 mt-1 space-y-1 border-l border-zinc-200 pl-3">
                <button
                  type="button"
                  onClick={() =>
                    navigateMobile(
                      "/dashboard",
                    )
                  }
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm transition ${
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
                  onClick={() =>
                    navigateMobile(
                      "/dashboard/maintenance",
                    )
                  }
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm transition ${
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
            onClick={() =>
              navigateMobile(
                "/calendar",
              )
            }
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
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
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
              />

              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>

            Calendário
          </button>

          {/* Nova tarefa */}

          <button
            type="button"
            onClick={() =>
              navigateMobile(
                "/tasks/new",
              )
            }
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
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

        {/* MOBILE LOGOUT */}

        <div className="shrink-0 border-t border-zinc-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
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

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        {/* HEADER */}

        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-lg font-bold tracking-tight text-zinc-950"
          >
            Simple Task
          </button>
        </div>

        {/* NAVIGATION */}

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
                onClick={
                  handleDashboardClick
                }
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

              <button
                type="button"
                onClick={() =>
                  setDashboardExpanded(
                    (current) =>
                      !current,
                  )
                }
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
                    dashboardExpanded
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Dashboard submenu */}

            {dashboardExpanded && (
              <div className="ml-6 mt-1 space-y-1 border-l border-zinc-200 pl-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/dashboard",
                    )
                  }
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
                  onClick={() =>
                    navigate(
                      "/dashboard/maintenance",
                    )
                  }
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
                    <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17v3h3l5.6-5.6a4 4 0 0 0-5.1-5.1l-2.2 2.2-2.8-.8-.8-2.8z" />
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
            onClick={() =>
              navigate("/calendar")
            }
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
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="2"
              />

              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>

            Calendário
          </button>

          {/* Nova tarefa */}

          <button
            type="button"
            onClick={() =>
              navigate("/tasks/new")
            }
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

        {/* LOGOUT */}

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
    </>
  );
}

export default DashboardSidebar;