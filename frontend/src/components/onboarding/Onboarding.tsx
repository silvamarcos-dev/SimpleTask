import {
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

const ONBOARDING_STORAGE_KEY =
  "simple-task-onboarding-completed";

type OnboardingProps = {
  onComplete?: () => void;
  newTaskRef?: RefObject<HTMLButtonElement | null>;
  metricsRef?: RefObject<HTMLElement | null>;
  todayTasksRef?: RefObject<HTMLElement | null>;
  calendarRef?: RefObject<HTMLElement | null>;
};

type Step = {
  title: string;
  description: string;
  icon: ReactNode;
  target?: "newTask" | "metrics" | "todayTasks" | "calendar";
};

const steps: Step[] = [
  {
    title: "Bem-vindo ao Simple Task",
    description:
      "Organize suas tarefas, acompanhe seu progresso e tenha mais controle sobre o seu dia.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Tenha uma visão do seu dia",
    description:
      "Acompanhe suas métricas e veja rapidamente como está o andamento das suas tarefas.",
    target: "metrics",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19V5" />
        <path d="M10 19V9" />
        <path d="M16 19V3" />
        <path d="M22 19V12" />
      </svg>
    ),
  },
  {
    title: "Crie tarefas rapidamente",
    description:
      "Use o botão Nova tarefa para registrar aquilo que precisa ser feito.",
    target: "newTask",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    title: "Acompanhe seu progresso",
    description:
      "Veja suas tarefas de hoje e marque cada uma como concluída conforme avança.",
    target: "todayTasks",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </svg>
    ),
  },
  {
    title: "Tudo pronto",
    description:
      "Agora você já conhece o essencial. Use o calendário para visualizar e organizar seus compromissos.",
    target: "calendar",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
      </svg>
    ),
  },
];

function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    localStorage.getItem(ONBOARDING_STORAGE_KEY) ===
    "true"
  );
}

function Onboarding({
  onComplete,
  newTaskRef,
  metricsRef,
  todayTasksRef,
  calendarRef,
}: OnboardingProps) {
  const [visible, setVisible] = useState(
    () => !hasCompletedOnboarding(),
  );

  const [currentStep, setCurrentStep] =
    useState(0);

  const [isLeaving, setIsLeaving] =
    useState(false);

  const [highlightRect, setHighlightRect] =
    useState<DOMRect | null>(null);

  const step = steps[currentStep];

  function getTargetElement(): HTMLElement | null {
    switch (step.target) {
      case "newTask":
        return newTaskRef?.current ?? null;

      case "metrics":
        return metricsRef?.current ?? null;

      case "todayTasks":
        return todayTasksRef?.current ?? null;

      case "calendar":
        return calendarRef?.current ?? null;

      default:
        return null;
    }
  }

  function updateHighlight() {
    const element = getTargetElement();

    if (!element) {
      setHighlightRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();

    setHighlightRect(rect);
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const target = getTargetElement();

    if (!target) {
      setHighlightRect(null);
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const timeout = window.setTimeout(() => {
      updateHighlight();
    }, 350);

    function handleResize() {
      updateHighlight();
    }

    function handleScroll() {
      updateHighlight();
    }

    window.addEventListener(
      "resize",
      handleResize,
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true,
    );

    return () => {
      window.clearTimeout(timeout);

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true,
      );
    };
  }, [
    currentStep,
    visible,
    newTaskRef,
    metricsRef,
    todayTasksRef,
    calendarRef,
  ]);

  function completeOnboarding() {
    setIsLeaving(true);

    window.setTimeout(() => {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        "true",
      );

      setVisible(false);
      setHighlightRect(null);

      onComplete?.();
    }, 250);
  }

  function handleNext() {
    if (currentStep === steps.length - 1) {
      completeOnboarding();
      return;
    }

    setCurrentStep((current) => current + 1);
  }

  function handlePrevious() {
    if (currentStep === 0) {
      return;
    }

    setCurrentStep((current) => current - 1);
  }

  function handleSkip() {
    completeOnboarding();
  }

  if (!visible) {
    return null;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep =
    currentStep === steps.length - 1;

  const hasHighlight =
    Boolean(step.target && highlightRect);

  const highlightStyle = highlightRect
    ? {
        top: `${highlightRect.top - 8}px`,
        left: `${highlightRect.left - 8}px`,
        width: `${highlightRect.width + 16}px`,
        height: `${highlightRect.height + 16}px`,
      }
    : undefined;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        isLeaving
          ? "pointer-events-none opacity-0"
          : "opacity-100"
      }`}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" />

      {/* HIGHLIGHT */}
      {hasHighlight && (
        <div
          className="pointer-events-none fixed z-[101] rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.55),0_0_35px_rgba(255,255,255,0.22)] transition-all duration-300"
          style={highlightStyle}
        />
      )}

      {/* CARD */}
      <div
        className={`absolute left-1/2 z-[102] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 transition-all duration-300 ${
          hasHighlight
            ? "bottom-6 sm:bottom-8"
            : "top-1/2 -translate-y-1/2"
        }`}
      >
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          {/* TOP */}
          <div className="flex items-center justify-between px-6 pt-6 sm:px-8 sm:pt-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <span className="text-sm font-semibold">
                  S
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">
                  Simple Task
                </p>

                <p className="text-[11px] text-slate-400">
                  v0.1.0
                </p>
              </div>
            </div>

            {!isLastStep && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-medium text-slate-400 transition hover:text-slate-700"
              >
                Pular
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
            <div
              key={currentStep}
              className="animate-[onboardingIn_400ms_ease-out]"
            >
              {/* ICON */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-slate-900 shadow-inner sm:h-20 sm:w-20 sm:rounded-[24px]">
                {step.icon}
              </div>

              {/* TEXT */}
              <div className="mx-auto mt-5 max-w-md text-center sm:mt-7">
                <h2 className="text-[1.5rem] font-semibold tracking-[-0.035em] text-slate-900 sm:text-[2rem]">
                  {step.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {step.description}
                </p>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mt-7 flex justify-center gap-1.5 sm:mt-9">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-7 bg-slate-900"
                      : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-7 flex items-center justify-between gap-3 sm:mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                  isFirstStep
                    ? "pointer-events-none opacity-0"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {isLastStep
                  ? "Começar"
                  : "Próximo"}

                <span className="text-base">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes onboardingIn {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Onboarding;