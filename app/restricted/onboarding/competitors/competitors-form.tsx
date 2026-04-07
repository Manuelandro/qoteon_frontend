"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

import { saveCompetitors, type OnboardingFormState } from "@/app/restricted/onboarding/actions";

const initialState: OnboardingFormState = undefined;

type SuggestedCompetitor = {
  competitor_domain: string;
  competitor_favicon: string;
  competitor_name: string;
};

type CompetitorsFormProps = {
  companyCategory: string;
  companyCountry: string;
  companyDomain: string;
  companyLanguages: string[];
  companyName: string;
  initialDomains: string[];
};

export function CompetitorsForm({
  companyCategory,
  companyCountry,
  companyDomain,
  companyLanguages,
  companyName,
  initialDomains,
}: CompetitorsFormProps) {
  const [state, action, pending] = useActionState(saveCompetitors, initialState);
  const [domains, setDomains] = useState(
    initialDomains.length > 0 ? initialDomains : ["", "", ""],
  );
  const [suggestions, setSuggestions] = useState<SuggestedCompetitor[]>([]);
  const [suggestionsError, setSuggestionsError] = useState<string>();
  const [suggestionsLoading, setSuggestionsLoading] = useState(initialDomains.length === 0);
  const companyLanguageLabel = companyLanguages.join(", ");

  useEffect(() => {
    if (initialDomains.length > 0) {
      return;
    }

    const controller = new AbortController();
    const payloadLanguages = companyLanguageLabel
      ? companyLanguageLabel.split(", ").filter(Boolean)
      : [];

    async function loadSuggestions() {
      setSuggestionsLoading(true);
      setSuggestionsError(undefined);

      try {
        const response = await fetch("/api/onboarding/competitor-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName,
            companyDomain,
            companyCategory,
            companyCountry,
            companyLanguages: payloadLanguages,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          error?: string;
          suggestions?: SuggestedCompetitor[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to generate competitor suggestions.");
        }

        const nextSuggestions = payload.suggestions ?? [];
        setSuggestions(nextSuggestions);

        if (nextSuggestions.length > 0) {
          setDomains((current) => {
            const hasUserInput = current.some((domain) => domain.trim().length > 0);

            if (hasUserInput) {
              return current;
            }

            return nextSuggestions.map((competitor) => competitor.competitor_domain);
          });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSuggestionsError(
          error instanceof Error ? error.message : "Unable to generate competitor suggestions.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSuggestionsLoading(false);
        }
      }
    }

    void loadSuggestions();

    return () => controller.abort();
  }, [
    companyCategory,
    companyCountry,
    companyDomain,
    companyLanguageLabel,
    companyName,
    initialDomains.length,
  ]);

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
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            AI suggestions
          </p>
          {suggestionsLoading ? (
            <p className="text-sm text-black/45">Finding top competitors...</p>
          ) : null}
        </div>

        {suggestions.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.competitor_domain}
                className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4"
              >
                <div className="flex items-center gap-3">
                  <Image
                    alt=""
                    className="h-10 w-10 rounded-full border border-black/8 bg-white"
                    height={40}
                    src={suggestion.competitor_favicon}
                    width={40}
                  />
                  <div>
                    <p className="font-medium text-black">{suggestion.competitor_name}</p>
                    <p className="text-sm text-black/45">{suggestion.competitor_domain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {suggestionsError ? (
          <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
            {suggestionsError}
          </p>
        ) : null}
      </div>

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
