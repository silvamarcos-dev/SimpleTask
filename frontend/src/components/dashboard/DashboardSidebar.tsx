import { useEffect, useState, type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/user";
import { removeToken } from "../../lib/authStorage";

import type { UserResponse } from "../../types/auth";

/* =========================================================
   PALETA
   base    #0E2A31  fundo
   raised  #143840  hover
   active  #1C5560  item ativo
   line    #1D454E  bordas
   muted   #9BB8BF  texto secundário
========================================================= */

/* =========================================================
   ICONS
========================================================= */

type IconProps = { className?: string };

function IconHome({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10V20h13V10" />
    </svg>
  );
}

function IconOverview({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.5 16v-4M12 16V8.5M16.5 16v-2.5" />
    </svg>
  );
}

function IconTasks({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}

function IconMaintenance({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17v3h3l5.6-5.6a4 4 0 0 0 5.1-5.1l-2.2 2.2-2.8-.8-.8-2.8z" />
      <path d="m16 8 2-2" />
    </svg>
  );
}

function IconCalendar({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    </svg>
  );
}

function IconBuilding({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9.5 7.5h1M13.5 7.5h1M9.5 11.5h1M13.5 11.5h1M9.5 15.5h1M13.5 15.5h1" />
    </svg>
  );
}

/* =========================================================
   DEPARTMENTS ICON
========================================================= */

function IconDepartments({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="15" width="7" height="5" rx="1.5" />
      <rect x="14" y="15" width="7" height="5" rx="1.5" />
      <path d="M10 7.5h4M10 17.5h4" />
    </svg>
  );
}

/* =========================================================
   MARKETING ICON
========================================================= */

function IconMarketing({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="3"
      />

      <path d="M8 2.5v3M16 2.5v3" />

      <path d="M3 9h18" />

      <path d="M8 13h3M13 13h3M8 17h3M13 17h3" />
    </svg>
  );
}

/* =========================================================
   MARKETING DASHBOARD ICON
========================================================= */

function IconMarketingDashboard({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 16v-3M12 16V8M17 16v-6" />
    </svg>
  );
}

function IconPlus({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconLogout({ className }: IconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
    </svg>
  );
}

function BrandMark({ className }: IconProps) {
  return (
    <span
      className={`flex items-center justify-center rounded-2xl bg-white text-[#0E2A31] ${
        className ?? "h-10 w-10"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12.5 4.5 4.5L19 7" />
      </svg>
    </span>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     ROUTES
  ===================================================== */

  const path = location.pathname;

  const isOverview = path === "/dashboard";

  const isMaintenance =
    path === "/dashboard/maintenance";

  const isMarketing =
    path === "/marketing" ||
    path.startsWith("/marketing/");

  const isDashboard =
    isOverview ||
    isMaintenance ||
    isMarketing;

  const isMarketingDashboard =
    path === "/marketing";

  const isMarketingCalendar =
    path === "/marketing/calendar";

  const isCalendar =
    path === "/calendar";

  const isNewTask =
    path === "/tasks/new";

  const isTasks =
    (path === "/tasks" ||
      path.startsWith("/tasks/")) &&
    !isNewTask;

  const isApartments =
    path === "/apartments" ||
    path.startsWith("/apartments/");

  const isDepartments =
    path === "/departments" ||
    path.startsWith("/departments/");

  /* =====================================================
     STATE
  ===================================================== */

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [
    dashboardExpanded,
    setDashboardExpanded,
  ] = useState(isDashboard);

  const [
    marketingExpanded,
    setMarketingExpanded,
  ] = useState(isMarketing);

  const [
    wasDashboard,
    setWasDashboard,
  ] = useState(isDashboard);

  const [user, setUser] =
    useState<UserResponse | null>(null);

  /*
   * Mantém o Dashboard aberto quando
   * estamos em uma rota pertencente ao Dashboard.
   */

  if (wasDashboard !== isDashboard) {
    setWasDashboard(isDashboard);

    if (isDashboard) {
      setDashboardExpanded(true);
    }
  }

  /*
   * Mantém Marketing aberto quando
   * estamos em qualquer rota de Marketing.
   */

  const [
    wasMarketing,
    setWasMarketing,
  ] = useState(isMarketing);

  if (wasMarketing !== isMarketing) {
    setWasMarketing(isMarketing);

    if (isMarketing) {
      setMarketingExpanded(true);
    }
  }

  const [
    desktopCollapsed,
    setDesktopCollapsed,
  ] = useState(() => {
    return (
      localStorage.getItem(
        "simple_task_sidebar_collapsed",
      ) === "true"
    );
  });

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const currentUser =
          await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        // O interceptor global trata sessões inválidas.
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     PERSIST DESKTOP SIDEBAR
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      "simple_task_sidebar_collapsed",
      String(desktopCollapsed),
    );
  }, [desktopCollapsed]);

  /* =====================================================
     MOBILE SCROLL LOCK + ESC
  ===================================================== */

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileOpen]);

  /* =====================================================
     ACTIONS
  ===================================================== */

  function go(target: string) {
    setMobileOpen(false);
    navigate(target);
  }

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  function toggleDesktopSidebar() {
    setDesktopCollapsed(
      (current) => !current,
    );
  }

  /* =====================================================
     USER
  ===================================================== */

  const userInitials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase(),
      )
      .join("") || "ST";

  /* =====================================================
     NAV ITEMS
  ===================================================== */

  const mainItems = [
    {
      label: "Tarefas",
      path: "/tasks",
      active: isTasks,
      icon: IconTasks,
    },
    {
      label: "Calendário",
      path: "/calendar",
      active: isCalendar,
      icon: IconCalendar,
    },
    {
      label: "Apartamentos",
      path: "/apartments",
      active: isApartments,
      icon: IconBuilding,
    },
    {
      label: "Departamentos",
      path: "/departments",
      active: isDepartments,
      icon: IconDepartments,
    },
  ];

  const secondaryItems = [
    {
      label: "Nova tarefa",
      path: "/tasks/new",
      active: isNewTask,
      icon: IconPlus,
    },
  ];

  /* =====================================================
     NAV BUTTON
  ===================================================== */

  function renderNavItem(
    item: {
      label: string;
      path: string;
      active: boolean;
      icon: (
        props: IconProps,
      ) => ReactElement;
    },
    collapsed: boolean,
  ) {
    const {
      label,
      path: target,
      active,
      icon: Icon,
    } = item;

    return (
      <button
        type="button"
        onClick={() => go(target)}
        title={
          collapsed
            ? label
            : undefined
        }
        aria-current={
          active
            ? "page"
            : undefined
        }
        className={`flex w-full items-center rounded-xl text-left text-[15px] font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
          active
            ? "bg-[#1C5560] text-white"
            : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
        } ${
          collapsed
            ? "h-11 justify-center"
            : "gap-3 px-3.5 py-2.5"
        }`}
      >
        <Icon className="shrink-0" />

        {!collapsed && (
          <span className="truncate">
            {label}
          </span>
        )}
      </button>
    );
  }

  /* =====================================================
     SHARED CONTENT
  ===================================================== */

  function renderSidebarContent(
    collapsed: boolean,
  ) {
    return (
      <>
        {/* BRAND */}

        <div
          className={`flex shrink-0 items-center ${
            collapsed
              ? "justify-center px-2 py-5"
              : "gap-3 px-5 py-6"
          }`}
        >
          <button
            type="button"
            onClick={() =>
              go("/dashboard")
            }
            title={
              collapsed
                ? "Simple Task"
                : undefined
            }
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E2A31]"
          >
            <BrandMark />

            {!collapsed && (
              <span>
                <span className="block text-[17px] font-semibold tracking-[-0.02em] text-white">
                  Simple Task
                </span>

                <span className="block text-xs text-[#9BB8BF]">
                  Foco no que importa
                </span>
              </span>
            )}
          </button>
        </div>

        {/* NAV */}

        <nav
          className={`flex-1 overflow-y-auto ${
            collapsed
              ? "px-2"
              : "px-3"
          }`}
        >
          {/* =================================================
              DASHBOARD + SUBMENU
          ================================================= */}

          <div>
            {/* DASHBOARD HEADER */}

            <div
              className={`flex items-center rounded-xl transition duration-200 ${
                isDashboard
                  ? "bg-[#1C5560] text-white"
                  : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
              } ${
                collapsed
                  ? "justify-center"
                  : ""
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setDashboardExpanded(
                    true,
                  );
                  go("/dashboard");
                }}
                title={
                  collapsed
                    ? "Dashboard"
                    : undefined
                }
                className={`flex items-center text-left text-[15px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  collapsed
                    ? "h-11 w-full justify-center"
                    : "flex-1 gap-3 px-3.5 py-2.5"
                }`}
              >
                <IconHome className="shrink-0" />

                {!collapsed && (
                  <span>
                    Dashboard
                  </span>
                )}
              </button>

              {!collapsed && (
                <button
                  type="button"
                  onClick={() =>
                    setDashboardExpanded(
                      (current) =>
                        !current,
                    )
                  }
                  aria-expanded={
                    dashboardExpanded
                  }
                  aria-label={
                    dashboardExpanded
                      ? "Recolher Dashboard"
                      : "Expandir Dashboard"
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      dashboardExpanded
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              )}
            </div>

            {/* DASHBOARD SUBMENU */}

            {!collapsed &&
              dashboardExpanded && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#1D454E] pl-3">
                  {/* VISÃO GERAL */}

                  <button
                    type="button"
                    onClick={() =>
                      go("/dashboard")
                    }
                    aria-current={
                      isOverview
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                      isOverview
                        ? "bg-[#143840] font-semibold text-white"
                        : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
                    }`}
                  >
                    <IconOverview className="shrink-0" />
                    Visão geral
                  </button>

                  {/* MANUTENÇÕES */}

                  <button
                    type="button"
                    onClick={() =>
                      go(
                        "/dashboard/maintenance",
                      )
                    }
                    aria-current={
                      isMaintenance
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                      isMaintenance
                        ? "bg-[#143840] font-semibold text-white"
                        : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
                    }`}
                  >
                    <IconMaintenance className="h-4 w-4 shrink-0" />
                    Manutenções
                  </button>

                  {/* =================================================
                      MARKETING
                  ================================================= */}

                  <div>
                    {/* MARKETING HEADER */}

                    <div
                      className={`flex items-center rounded-lg transition duration-200 ${
                        isMarketing
                          ? "bg-[#143840] text-white"
                          : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMarketingExpanded(
                            true,
                          );
                          go("/marketing");
                        }}
                        aria-current={
                          isMarketing
                            ? "page"
                            : undefined
                        }
                        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <IconMarketing className="h-4 w-4 shrink-0" />

                        <span className="truncate">
                          Marketing
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setMarketingExpanded(
                            (current) =>
                              !current,
                          )
                        }
                        aria-expanded={
                          marketingExpanded
                        }
                        aria-label={
                          marketingExpanded
                            ? "Recolher Marketing"
                            : "Expandir Marketing"
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${
                            marketingExpanded
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    {/* MARKETING SUBMENU */}

                    {marketingExpanded && (
                      <div className="ml-5 mt-1 space-y-1 border-l border-[#1D454E] pl-3">
                        {/* DASHBOARD MARKETING */}

                        <button
                          type="button"
                          onClick={() =>
                            go("/marketing")
                          }
                          aria-current={
                            isMarketingDashboard
                              ? "page"
                              : undefined
                          }
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                            isMarketingDashboard
                              ? "bg-[#1C5560] font-semibold text-white"
                              : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
                          }`}
                        >
                          <IconMarketingDashboard className="h-4 w-4 shrink-0" />
                          Dashboard
                        </button>

                        {/* CALENDÁRIO MARKETING */}

                        <button
                          type="button"
                          onClick={() =>
                            go(
                              "/marketing/calendar",
                            )
                          }
                          aria-current={
                            isMarketingCalendar
                              ? "page"
                              : undefined
                          }
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                            isMarketingCalendar
                              ? "bg-[#1C5560] font-semibold text-white"
                              : "text-[#9BB8BF] hover:bg-[#143840] hover:text-white"
                          }`}
                        >
                          <IconCalendar className="h-4 w-4 shrink-0" />
                          Calendário
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* =================================================
              MAIN ITEMS
          ================================================= */}

          <div className="mt-1 space-y-1">
            {mainItems.map(
              (item) => (
                <div
                  key={item.path}
                >
                  {renderNavItem(
                    item,
                    collapsed,
                  )}
                </div>
              ),
            )}
          </div>

          {/* DIVIDER */}

          <div
            className={`my-4 border-t border-[#1D454E] ${
              collapsed
                ? "mx-1"
                : "mx-3.5"
            }`}
          />

          {/* MAIS */}

          {!collapsed && (
            <p className="px-3.5 pb-2 text-xs font-medium text-[#7C9BA3]">
              Mais
            </p>
          )}

          <div className="space-y-1">
            {secondaryItems.map(
              (item) => (
                <div
                  key={item.path}
                >
                  {renderNavItem(
                    item,
                    collapsed,
                  )}
                </div>
              ),
            )}
          </div>
        </nav>

        {/* =====================================================
            PROFILE + LOGOUT
        ===================================================== */}

        <div
          className={`shrink-0 border-t border-[#1D454E] ${
            collapsed
              ? "p-2"
              : "p-3"
          }`}
        >
          <button
            type="button"
            onClick={() =>
              go("/dashboard")
            }
            title={
              collapsed
                ? user?.name ||
                  "Perfil"
                : undefined
            }
            className={`flex w-full items-center rounded-xl transition duration-200 hover:bg-[#143840] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
              collapsed
                ? "justify-center p-2"
                : "gap-3 px-2.5 py-2.5"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0E2A31]">
              {userInitials}
            </span>

            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold text-white">
                    {user?.name ||
                      "Carregando..."}
                  </span>

                  <span className="block truncate text-xs text-[#9BB8BF]">
                    {user?.email || ""}
                  </span>
                </span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[#6F919A]"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </>
            )}
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Sair"
                : undefined
            }
            className={`mt-1 flex w-full items-center rounded-xl text-[15px] font-medium text-[#9BB8BF] transition duration-200 hover:bg-[#143840] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
              collapsed
                ? "h-11 justify-center"
                : "gap-3 px-3.5 py-2.5"
            }`}
          >
            <IconLogout className="shrink-0" />

            {!collapsed && (
              <span>Sair</span>
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[#0E2A31] px-4 lg:hidden">
        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#9BB8BF] transition hover:bg-[#143840] hover:text-white"
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
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          className="flex items-center gap-2"
        >
          <BrandMark className="h-8 w-8 rounded-xl" />

          <span className="text-base font-semibold tracking-[-0.02em] text-white">
            Simple Task
          </span>
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
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-[#06171B]/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] flex-col bg-[#0E2A31] shadow-[0_20px_60px_rgba(6,23,27,0.45)] transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Fechar menu"
          className="absolute right-3 top-6 flex h-9 w-9 items-center justify-center rounded-xl text-[#9BB8BF] transition hover:bg-[#143840] hover:text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {renderSidebarContent(false)}
      </aside>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className={`relative hidden min-h-screen shrink-0 flex-col bg-[#0E2A31] transition-[width] duration-300 ease-out lg:flex ${
          desktopCollapsed
            ? "w-19"
            : "w-68"
        }`}
      >
        <button
          type="button"
          onClick={
            toggleDesktopSidebar
          }
          aria-label={
            desktopCollapsed
              ? "Expandir menu"
              : "Recolher menu"
          }
          title={
            desktopCollapsed
              ? "Expandir menu"
              : "Recolher menu"
          }
          className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#1D454E] bg-[#0E2A31] text-[#9BB8BF] shadow-sm transition hover:text-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${
              desktopCollapsed
                ? ""
                : "rotate-180"
            }`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {renderSidebarContent(
          desktopCollapsed,
        )}
      </aside>
    </>
  );
}

export default DashboardSidebar;