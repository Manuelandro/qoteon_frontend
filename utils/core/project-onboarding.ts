export type ProjectOnboardingUiStatus =
  | "initializing"
  | "generating_prompts"
  | "crawling_page"
  | "running_baseline"
  | "completed";

export interface ProjectOnboardingProgressResponse {
  projectId: string;
  status: ProjectOnboardingUiStatus;
  progressPercent: number;
  message: string;
  isTerminal: boolean;
  dashboardReady: boolean;
  pollAfterMs: number;
  backendStateCode: string | null;
  backendStateMessage: string | null;
}

export type ProjectOnboardingModalState = {
  isVisible: boolean;
  mode: "progress" | "blocked";
  title: string;
  message: string;
  progressPercent: number;
  hint: string;
  transientErrorMessage: string | null;
  backendStateCode: string | null;
};

const DEFAULT_PROGRESS_STATE: ProjectOnboardingProgressResponse = {
  projectId: "",
  status: "initializing",
  progressPercent: 15,
  message: "Setting up the project",
  isTerminal: false,
  dashboardReady: false,
  pollAfterMs: 3000,
  backendStateCode: null,
  backendStateMessage: null,
};

export function buildOnboardingDashboardHref(projectId: string) {
  const params = new URLSearchParams({
    onboarding: "1",
    projectId,
  });

  return `/restricted?${params.toString()}`;
}

export function buildCleanDashboardHref(
  pathname: string,
  searchParams: { toString(): string },
) {
  const params = new URLSearchParams(searchParams.toString());

  params.delete("onboarding");
  params.delete("projectId");

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function shouldDeferDashboardDataDuringOnboarding(input: {
  projectId: string;
  onboardingFlag?: string | null;
  onboardingProjectId?: string | null;
}) {
  if (!input.projectId) {
    return false;
  }

  return (
    input.onboardingFlag === "1" &&
    (!input.onboardingProjectId || input.onboardingProjectId === input.projectId)
  );
}

export function shouldRefreshDashboardAfterOnboarding(
  previous: ProjectOnboardingProgressResponse | null,
  current: ProjectOnboardingProgressResponse | null,
) {
  return Boolean(current?.dashboardReady) && !previous?.dashboardReady;
}

export function shouldShowProjectOnboardingProgressModal(input: {
  pathname: string;
  activeProjectId: string | null;
  dismissed: boolean;
}) {
  if (!input.activeProjectId || input.dismissed) {
    return false;
  }

  return !input.pathname.startsWith("/restricted/onboarding");
}

export function getProjectOnboardingModalState(
  progress: ProjectOnboardingProgressResponse | null,
  errorMessage: string | null,
): ProjectOnboardingModalState {
  if (progress?.dashboardReady || progress?.status === "completed") {
    return {
      isVisible: false,
      mode: "progress",
      title: "Preparing your dashboard",
      message: progress.message,
      progressPercent: progress.progressPercent,
      hint: "This usually takes a few minutes.",
      transientErrorMessage: null,
      backendStateCode: progress.backendStateCode,
    };
  }

  if (progress?.isTerminal && !progress.dashboardReady) {
    return {
      isVisible: true,
      mode: "blocked",
      title: "Setup is taking longer than expected",
      message:
        progress.backendStateMessage ??
        "The automated setup is temporarily blocked. The dashboard stays available while recovery catches up.",
      progressPercent: progress.progressPercent,
      hint: "You can continue into the dashboard now and check back shortly.",
      transientErrorMessage: null,
      backendStateCode: progress.backendStateCode,
    };
  }

  const currentProgress = progress ?? DEFAULT_PROGRESS_STATE;

  return {
    isVisible: true,
    mode: "progress",
    title: "Preparing your dashboard",
    message: currentProgress.message,
    progressPercent: currentProgress.progressPercent,
    hint: "This usually takes a few minutes.",
    transientErrorMessage: errorMessage,
    backendStateCode: currentProgress.backendStateCode,
  };
}
