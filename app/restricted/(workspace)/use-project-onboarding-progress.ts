"use client";

import { useEffect, useRef, useState } from "react";

import { getCoreProjectOnboardingProgressBrowser } from "@/utils/core/browser-client";
import type { ProjectOnboardingProgressResponse } from "@/utils/core/project-onboarding";

const DEFAULT_POLL_AFTER_MS = 3_000;

export function useProjectOnboardingProgress({
  coreApiBaseUrl,
  enabled,
  projectId,
}: {
  coreApiBaseUrl: string;
  enabled: boolean;
  projectId: string;
}) {
  const [progress, setProgress] = useState<ProjectOnboardingProgressResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastPollAfterMsRef = useRef(DEFAULT_POLL_AFTER_MS);
  const isLoading = enabled && progress === null && errorMessage === null;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;

    async function poll() {
      try {
        const nextProgress = await getCoreProjectOnboardingProgressBrowser(
          projectId,
          coreApiBaseUrl,
        );

        if (cancelled) {
          return;
        }

        lastPollAfterMsRef.current = nextProgress.pollAfterMs || DEFAULT_POLL_AFTER_MS;
        setProgress(nextProgress);
        setErrorMessage(null);

        if (nextProgress.dashboardReady || nextProgress.isTerminal) {
          return;
        }

        timeoutId = window.setTimeout(() => {
          void poll();
        }, lastPollAfterMsRef.current);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to refresh onboarding progress from Core.",
        );

        timeoutId = window.setTimeout(() => {
          void poll();
        }, lastPollAfterMsRef.current);
      }
    }

    void poll();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [coreApiBaseUrl, enabled, projectId]);

  return {
    progress,
    errorMessage,
    isLoading,
  };
}
