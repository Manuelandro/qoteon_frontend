"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  buildCleanDashboardHref,
  getProjectOnboardingModalState,
  getProjectOnboardingSessionStorageKey,
  shouldRefreshDashboardAfterOnboarding,
  shouldTrackProjectOnboarding,
} from "@/utils/core/project-onboarding";

import { useProjectOnboardingProgress } from "./use-project-onboarding-progress";

type ProjectOnboardingProgressModalProps = {
  coreApiBaseUrl: string;
  onboardingFlag: string | null;
  onboardingProjectId: string | null;
  projectId: string;
};

export function ProjectOnboardingProgressModal({
  coreApiBaseUrl,
  onboardingFlag,
  onboardingProjectId,
  projectId,
}: ProjectOnboardingProgressModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const previousProgressRef = useRef<ReturnType<
    typeof useProjectOnboardingProgress
  >["progress"]>(null);
  const cleanHref = useMemo(
    () => buildCleanDashboardHref(pathname, searchParams),
    [pathname, searchParams],
  );
  const onboardingSessionStorageKey = getProjectOnboardingSessionStorageKey(projectId);
  const persistedProjectId =
    onboardingFlag === "1"
      ? projectId
      : typeof window === "undefined"
        ? null
        : window.sessionStorage.getItem(onboardingSessionStorageKey);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (onboardingFlag === "1") {
      window.sessionStorage.setItem(onboardingSessionStorageKey, projectId);
    }
  }, [onboardingFlag, onboardingSessionStorageKey, projectId]);

  const shouldTrack = shouldTrackProjectOnboarding({
    projectId,
    onboardingFlag,
    onboardingProjectId,
    persistedProjectId,
  });
  const enabled = shouldTrack && !dismissed;
  const { errorMessage, progress, isLoading } = useProjectOnboardingProgress({
    coreApiBaseUrl,
    enabled,
    projectId,
  });
  const modalState = getProjectOnboardingModalState(progress, errorMessage);

  useEffect(() => {
    if (!shouldRefreshDashboardAfterOnboarding(previousProgressRef.current, progress)) {
      previousProgressRef.current = progress;
      return;
    }

    previousProgressRef.current = progress;

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(onboardingSessionStorageKey);
    }

    startTransition(() => {
      router.replace(cleanHref);
      router.refresh();
    });
  }, [cleanHref, onboardingSessionStorageKey, progress, router]);

  if (!enabled || !modalState.isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f3ede1]/78 px-6 py-10 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-black/8 bg-white px-7 py-7 shadow-[0_26px_80px_rgba(17,17,17,0.12)] sm:px-8 sm:py-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-black/42">Project setup</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.04em] text-black sm:text-4xl">
          {modalState.title}
        </h2>
        <p className="mt-4 text-base leading-8 text-black/64">{modalState.message}</p>

        <div className="mt-7 rounded-full bg-black/8 p-1">
          <div
            className="h-3 rounded-full bg-black transition-[width] duration-500 ease-out"
            style={{ width: `${modalState.progressPercent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-black/50">
          <span>{modalState.progressPercent}%</span>
          <span>
            {isLoading && !progress ? "Connecting to Core..." : "Refreshing automatically"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-black/50">{modalState.hint}</p>

        {modalState.transientErrorMessage ? (
          <p className="mt-4 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-950">
            {modalState.transientErrorMessage} Retrying automatically.
          </p>
        ) : null}

        {modalState.backendStateCode ? (
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-black/35">
            Backend state: {modalState.backendStateCode}
          </p>
        ) : null}

        {modalState.mode === "blocked" ? (
          <div className="mt-7 flex justify-end">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-medium text-black transition hover:border-black/20 hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isNavigating}
              onClick={() => {
                setDismissed(true);

                if (typeof window !== "undefined") {
                  window.sessionStorage.removeItem(onboardingSessionStorageKey);
                }

                startTransition(() => {
                  router.replace(cleanHref);
                });
              }}
              type="button"
            >
              {isNavigating ? "Opening dashboard..." : "Continue to dashboard"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
