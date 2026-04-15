"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

type IconProps = {
  className?: string;
};

type WorkspaceNavItem = {
  href: string;
  icon: (props: IconProps) => React.ReactNode;
  label: string;
  segment: string | null;
};

const workspaceNavItems: WorkspaceNavItem[] = [
  {
    href: "/restricted",
    icon: OverviewIcon,
    label: "Overview",
    segment: null,
  },
  {
    href: "/restricted/models",
    icon: ModelsIcon,
    label: "Models",
    segment: "models",
  },
  {
    href: "/restricted/clusters",
    icon: ClustersIcon,
    label: "Clusters",
    segment: "clusters",
  },
  {
    href: "/restricted/competitors",
    icon: CompetitorsIcon,
    label: "Competitors",
    segment: "competitors",
  },
  {
    href: "/restricted/trends",
    icon: TrendsIcon,
    label: "Trends",
    segment: "trends",
  },
  {
    href: "/restricted/runs",
    icon: RunsIcon,
    label: "Runs",
    segment: "runs",
  },
  {
    href: "/restricted/prompts",
    icon: PromptsIcon,
    label: "Prompts",
    segment: "prompts",
  },
  {
    href: "/restricted/data-health",
    icon: DataHealthIcon,
    label: "Data Health",
    segment: "data-health",
  },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function OverviewIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect height="7" rx="1.5" width="7" x="3" y="3" />
      <rect height="7" rx="1.5" width="11" x="10" y="3" />
      <rect height="11" rx="1.5" width="7" x="3" y="10" />
      <rect height="11" rx="1.5" width="11" x="10" y="10" />
    </svg>
  );
}

function ModelsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M4 18.5h16" />
      <path d="M6.5 18.5v-4" />
      <path d="M11.5 18.5v-8" />
      <path d="M16.5 18.5V7" />
      <path d="m5.5 10.5 4-3.5 3.5 2.5 5-5" />
    </svg>
  );
}

function ClustersIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M7 7.5h10" />
      <path d="M7 12h10" />
      <path d="M7 16.5h6" />
      <circle cx="17" cy="16.5" r="1.5" />
      <circle cx="5" cy="7.5" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  );
}

function TrendsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M4 19.5h16" />
      <path d="m5.5 15 4-4 3 2 5-6" />
      <path d="m14.5 7 3-.5-.5 3" />
    </svg>
  );
}

function CompetitorsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v3" />
      <path d="M21.5 12h-3" />
      <path d="M12 18.5v3" />
      <path d="M5.5 12h-3" />
    </svg>
  );
}

function RunsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" width="16" x="4" y="5" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M4 9.5h16" />
      <path d="M8 13h3" />
      <path d="M8 16h6" />
    </svg>
  );
}

function PromptsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M5 6.5h14" />
      <path d="M5 11.5h10" />
      <path d="M5 16.5h8" />
      <path d="m16.5 10.5 2 2 3.5-4" />
    </svg>
  );
}

function DataHealthIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M12 20.5s7-3.5 7-9v-5l-7-3-7 3v5c0 5.5 7 9 7 9Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4.3" />
    </svg>
  );
}

type WorkspaceNavigationProps = {
  workspaceLabel: string;
};

export function WorkspaceNavigation({ workspaceLabel }: WorkspaceNavigationProps) {
  const segment = useSelectedLayoutSegment();
  const workspaceInitial = workspaceLabel.trim().charAt(0).toUpperCase() || "Q";

  return (
    <>
      <nav
        aria-label="Workspace sections"
        className="overflow-x-auto pb-1 lg:hidden"
      >
        <div className="flex min-w-max gap-2">
          {workspaceNavItems.map((item) => {
            const isActive = item.segment === segment;

            return (
              <Link
                key={item.href}
                className={joinClasses(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-black bg-black text-white shadow-[0_14px_40px_rgba(17,17,17,0.14)]"
                    : "border-black/8 bg-white/72 text-black/68 hover:border-black/15 hover:bg-white hover:text-black",
                )}
                href={item.href}
              >
                <span
                  className={joinClasses(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isActive ? "bg-white/12" : "bg-black/[0.04]",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <div className="group/sidebar flex h-dvh w-24 flex-col overflow-hidden border-r border-black/8 bg-[rgba(255,255,255,0.84)] px-5 py-6 shadow-[0_18px_60px_rgba(17,17,17,0.04)] backdrop-blur-xl transition-[width,box-shadow] duration-300 ease-out hover:w-72 hover:shadow-[0_24px_90px_rgba(17,17,17,0.08)] focus-within:w-72 focus-within:shadow-[0_24px_90px_rgba(17,17,17,0.08)]">
          <div className="flex justify-center group-hover/sidebar:justify-start group-focus-within/sidebar:justify-start">
            <div className="flex h-12 w-12 flex-none items-center justify-center gap-0 rounded-2xl bg-black text-sm font-semibold text-white transition-[width,height,border-radius,padding,gap] duration-300 ease-out group-hover/sidebar:h-16 group-hover/sidebar:w-full group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:rounded-[1.5rem] group-hover/sidebar:px-4 group-focus-within/sidebar:h-16 group-focus-within/sidebar:w-full group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3 group-focus-within/sidebar:rounded-[1.5rem] group-focus-within/sidebar:px-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-white/10">
                {workspaceInitial}
              </span>
              <div className="grid w-0 min-w-0 overflow-hidden opacity-0 transition-[width,opacity,transform] duration-200 ease-out -translate-x-1 group-hover/sidebar:w-[11rem] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:w-[11rem] group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100">
                <p className="truncate whitespace-nowrap text-sm font-medium">
                  {workspaceLabel}
                </p>
                <p className="truncate whitespace-nowrap text-xs text-white/55">
                  Workspace
                </p>
              </div>
            </div>
          </div>

          <nav
            aria-label="Workspace sections"
            className="mt-8 grid gap-3 justify-items-center group-hover/sidebar:justify-items-stretch group-focus-within/sidebar:justify-items-stretch"
          >
            {workspaceNavItems.map((item) => {
              const isActive = item.segment === segment;

              return (
                <Link
                  key={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={joinClasses(
                    "flex h-12 w-12 items-center justify-center gap-0 overflow-hidden rounded-full border text-sm transition-[width,border-radius,padding,background-color,color,box-shadow,gap] duration-300 ease-out",
                    "group-hover/sidebar:w-full group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:rounded-[1.35rem] group-hover/sidebar:px-3 group-focus-within/sidebar:w-full group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3 group-focus-within/sidebar:rounded-[1.35rem] group-focus-within/sidebar:px-3",
                    isActive
                      ? "border-black bg-black text-white shadow-[0_16px_36px_rgba(17,17,17,0.14)]"
                      : "border-black/6 bg-white/72 text-black/64 hover:border-black/12 hover:bg-white hover:text-black",
                  )}
                  href={item.href}
                >
                  <span
                    className={joinClasses(
                      "flex h-12 w-12 flex-none items-center justify-center rounded-full transition-[border-radius,background-color] duration-300 ease-out group-hover/sidebar:h-10 group-hover/sidebar:w-10 group-hover/sidebar:rounded-xl group-focus-within/sidebar:h-10 group-focus-within/sidebar:w-10 group-focus-within/sidebar:rounded-xl",
                      isActive ? "bg-white/12" : "bg-black/[0.04]",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-[width,opacity,transform] duration-200 ease-out -translate-x-1 group-hover/sidebar:w-[9rem] group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:w-[9rem] group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
