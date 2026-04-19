"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { saveCompetitors, type OnboardingFormState } from "@/app/restricted/onboarding/actions";
import {
  dispatchProjectOnboardingHandoffCancel,
  dispatchProjectOnboardingHandoffStart,
} from "@/app/restricted/restricted-onboarding-progress-modal";
import { ONBOARDING_MAX_COMPETITORS } from "@/utils/core/competitor-limits";
import {
  buildInitialOnboardingCompetitorDomains,
  mergeOnboardingPrefilledCompetitorDomains,
} from "@/utils/core/onboarding-competitor-prefill";

const initialState: OnboardingFormState = undefined;

type CompetitorsFormProps = {
  initialDomains: string[];
  shouldAutoPrefill: boolean;
};

type PrefillResponse = {
  competitors?: string[];
  error?: string | { message?: string } | null;
  code?: string;
};

const MANUAL_COMPETITOR_FALLBACK_MESSAGE =
  "Automatic competitor prefill is temporarily unavailable. Add competitor domains manually to continue onboarding.";
const PREFILL_REQUEST_TIMEOUT_MS = 15000;

export function CompetitorsForm({
  initialDomains,
  shouldAutoPrefill,
}: CompetitorsFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCompetitors, initialState);
  const [domains, setDomains] = useState(() =>
    buildInitialOnboardingCompetitorDomains(initialDomains),
  );
  const [prefillError, setPrefillError] = useState<string>();
  const [prefillLoading, setPrefillLoading] = useState(shouldAutoPrefill);
  const hasStartedPrefill = useRef(false);

  useEffect(() => {
    if (!state?.redirectTo) {
      return;
    }

    if (typeof window !== "undefined") {
      const redirectUrl = new URL(state.redirectTo, window.location.origin);
      const onboardingProjectId = redirectUrl.searchParams.get("projectId");

      if (onboardingProjectId) {
        dispatchProjectOnboardingHandoffStart(onboardingProjectId);
      }
    }

    router.replace(state.redirectTo);
  }, [router, state?.redirectTo]);

  useEffect(() => {
    void router.prefetch("/restricted");
  }, [router]);

  useEffect(() => {
    if (pending || state?.redirectTo || !state?.error) {
      return;
    }

    dispatchProjectOnboardingHandoffCancel();
  }, [pending, state?.error, state?.redirectTo]);

  useEffect(() => {
    if (!shouldAutoPrefill) {
      setPrefillLoading(false);
      return;
    }

    if (hasStartedPrefill.current) {
      return;
    }

    hasStartedPrefill.current = true;

    async function readJson(response: Response) {
      return (await response.json()) as PrefillResponse;
    }

    function getPayloadErrorMessage(
      payload: PrefillResponse,
      fallback: string,
    ) {
      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }

      if (
        payload.error &&
        typeof payload.error === "object" &&
        typeof payload.error.message === "string" &&
        payload.error.message.trim().length > 0
      ) {
        return payload.error.message;
      }

      return fallback;
    }

    function applyPrefilledDomains(nextDomains: string[]) {
      setDomains((current) =>
        mergeOnboardingPrefilledCompetitorDomains(current, nextDomains),
      );
    }

    async function startPrefill() {
      try {
        const response = await fetch("/api/onboarding/competitors/prefill", {
          method: "POST",
          signal: AbortSignal.timeout(PREFILL_REQUEST_TIMEOUT_MS),
        });

        const payload = await readJson(response);

        if (!response.ok) {
          throw new Error(
            getPayloadErrorMessage(
              payload,
              "Unable to start onboarding competitor prefills.",
            ),
          );
        }

        const nextDomains = payload.competitors ?? [];

        if (nextDomains.length === 0) {
          setPrefillError(MANUAL_COMPETITOR_FALLBACK_MESSAGE);
          return;
        }

        applyPrefilledDomains(nextDomains);
      } catch (error) {
        setPrefillError(
          error instanceof Error &&
            (error.name === "TimeoutError" || error.name === "AbortError")
            ? MANUAL_COMPETITOR_FALLBACK_MESSAGE
            : error instanceof Error
              ? error.message
              : "Unable to start onboarding competitor prefills.",
        );
      } finally {
        setPrefillLoading(false);
      }
    }

    setPrefillError(undefined);
    setPrefillLoading(true);
    void startPrefill();
  }, [shouldAutoPrefill]);

  const selectedCount = domains.filter((domain) => domain.trim().length > 0).length;
  const showManualFallback = Boolean(prefillError);
  const introMessage =
    prefillLoading && shouldAutoPrefill
      ? `Qoteon is looking for competitor suggestions through Core. You can still add or edit domains manually while the request is running.`
      : showManualFallback
        ? `Automatic competitor prefill is unavailable right now. Add between 1 and ${ONBOARDING_MAX_COMPETITORS} competitor domains manually to continue.`
        : `Keep up to ${ONBOARDING_MAX_COMPETITORS} competitor domains in this list. Replace or remove any domain that does not matter for ${selectedCount > 0 ? "this project" : "your market"}.`;

  function updateDomain(index: number, value: string) {
    setDomains((current) =>
      current.map((domain, currentIndex) => (currentIndex === index ? value : domain)),
    );
  }

  function addDomainField() {
    setDomains((current) =>
      current.length >= ONBOARDING_MAX_COMPETITORS ? current : [...current, ""],
    );
  }

  function removeDomainField(index: number) {
    setDomains((current) =>
      current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-black/62">
        {introMessage}
      </div>

      {prefillLoading ? (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-black" />
          <span>Finding competitor suggestions...</span>
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
        {domains.length < ONBOARDING_MAX_COMPETITORS ? (
          <button
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
            onClick={addDomainField}
            type="button"
          >
            Add another domain
          </button>
        ) : null}
        <p className="self-center text-sm text-black/45">
          {selectedCount} of {ONBOARDING_MAX_COMPETITORS} selected. Add at least 1 to continue.
        </p>
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
        {pending
          ? "Saving competitors..."
          : state?.redirectTo
            ? "Opening workspace..."
            : "Finish setup and access workspace"}
      </button>
    </form>
  );
}
