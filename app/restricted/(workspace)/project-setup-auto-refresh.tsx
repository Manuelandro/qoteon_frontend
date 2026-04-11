"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

type ProjectSetupAutoRefreshProps = {
  intervalMs: number | null;
  shouldPoll: boolean;
};

export function ProjectSetupAutoRefresh({
  intervalMs,
  shouldPoll,
}: ProjectSetupAutoRefreshProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  useEffect(() => {
    if (!shouldPoll || !intervalMs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, router, shouldPoll]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRefreshing}
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
        type="button"
      >
        {isRefreshing ? "Refreshing..." : "Refresh status"}
      </button>
      {shouldPoll && intervalMs ? (
        <p className="text-sm text-black/45">
          Auto-refreshing every {Math.round(intervalMs / 1000)}s while setup is still running.
        </p>
      ) : (
        <p className="text-sm text-black/45">
          Auto-refresh stops once the setup becomes ready or blocked.
        </p>
      )}
    </div>
  );
}
