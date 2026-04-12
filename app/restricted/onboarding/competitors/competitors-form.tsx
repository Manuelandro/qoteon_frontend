"use client";

import { useActionState, useEffect, useState } from "react";

import { saveCompetitors, type OnboardingFormState } from "@/app/restricted/onboarding/actions";

const initialState: OnboardingFormState = undefined;

type CompetitorsFormProps = {
  initialDomains: string[];
  shouldAutoPrefill: boolean;
};

type PrefillResponse = {
  competitors?: string[];
  error?: string;
};

export function CompetitorsForm({ initialDomains, shouldAutoPrefill }: CompetitorsFormProps) {
  const [state, action, pending] = useActionState(saveCompetitors, initialState);
  const [domains, setDomains] = useState(
    initialDomains.length > 0 ? initialDomains : ["", "", "", "", ""],
  );
  const [prefillError, setPrefillError] = useState<string>();
  const [prefillLoading, setPrefillLoading] = useState(shouldAutoPrefill);

  useEffect(() => {
    if (!shouldAutoPrefill) {
      setPrefillLoading(false);
      return;
    }

    let cancelled = false;
    let finished = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    async function readJson(response: Response) {
      return (await response.json()) as PrefillResponse;
    }

    function applyPrefilledDomains(nextDomains: string[]) {
      if (nextDomains.length === 0) {
        return;
      }

      setDomains((current) => {
        const currentNonEmpty = current.filter((value) => value.trim().length > 0);

        if (currentNonEmpty.length === 0) {
          return nextDomains;
        }

        const seen = new Set(currentNonEmpty.map((value) => value.trim().toLowerCase()));
        const merged = [...current];

        for (const domain of nextDomains) {
          const normalizedDomain = domain.trim().toLowerCase();

          if (!normalizedDomain || seen.has(normalizedDomain)) {
            continue;
          }

          const emptyIndex = merged.findIndex((value) => value.trim().length === 0);

          if (emptyIndex >= 0) {
            merged[emptyIndex] = domain;
          } else {
            merged.push(domain);
          }

          seen.add(normalizedDomain);
        }

        return merged;
      });
    }

    function finishLoading() {
      finished = true;
      setPrefillLoading(false);

      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    }

    async function pollPrefillStatus() {
      if (cancelled || finished) {
        return;
      }

      try {
        const response = await fetch("/api/onboarding/competitors/prefill");
        const payload = await readJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to read onboarding competitor prefills.");
        }

        const nextDomains = payload.competitors ?? [];

        if (nextDomains.length > 0) {
          applyPrefilledDomains(nextDomains);
          finishLoading();
          return;
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPrefillError(
          error instanceof Error
            ? error.message
            : "Unable to read onboarding competitor prefills.",
        );
        finishLoading();
        return;
      }

      if (!cancelled && !finished) {
        pollTimer = setTimeout(() => {
          void pollPrefillStatus();
        }, 500);
      }
    }

    async function startPrefill() {
      try {
        const response = await fetch("/api/onboarding/competitors/prefill", {
          method: "POST",
        });
        const payload = await readJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to start onboarding competitor prefills.");
        }

        const nextDomains = payload.competitors ?? [];

        if (nextDomains.length > 0) {
          applyPrefilledDomains(nextDomains);
          finishLoading();
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPrefillError(
          error instanceof Error
            ? error.message
            : "Unable to start onboarding competitor prefills.",
        );
        finishLoading();
      }
    }

    setPrefillError(undefined);
    setPrefillLoading(true);
    void pollPrefillStatus();
    void startPrefill();

    return () => {
      cancelled = true;

      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [shouldAutoPrefill]);

  function updateDomain(index: number, value: string) {
    setDomains((current) =>
      current.map((domain, currentIndex) => (currentIndex === index ? value : domain)),
    );
  }

  function addDomainField() {
    setDomains((current) => [...current, ""]);
  }

  function removeDomainField(index: number) {
    setDomains((current) =>
      current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-black/62">
        Qoteon prefilled the first competitor set through Core. Review the domains below,
        remove the ones that do not matter, and add any others you want tracked.
      </div>

      {prefillLoading ? (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-black" />
          <span>Finding the first competitors...</span>
        </div>
      ) : null}

      {prefillError ? (
        <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
          {prefillError}
        </p>
      ) : null}

      <div className="grid gap-4">
        {domains.map((domain, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-[1.5rem] border border-black/8 bg-white px-4 py-3"
          >
            <input
              className="h-10 flex-1 bg-transparent text-base text-black outline-none placeholder:text-black/35"
              name="domains"
              onChange={(event) => updateDomain(index, event.target.value)}
              placeholder="competitor.com"
              type="text"
              value={domain}
            />
            <button
              className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-black/45 transition hover:border-black/20 hover:text-black"
              onClick={() => removeDomainField(index)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
          onClick={addDomainField}
          type="button"
        >
          Add another domain
        </button>
      </div>

      {state?.error ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/55"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving competitors..." : "Finish setup and access workspace"}
      </button>
    </form>
  );
}
