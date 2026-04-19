import { ONBOARDING_MAX_COMPETITORS } from "./competitor-limits";

export function buildInitialOnboardingCompetitorDomains(
  initialDomains: string[],
  maxCompetitors = ONBOARDING_MAX_COMPETITORS,
) {
  const normalizedDomains = normalizeCompetitorDomains(initialDomains, maxCompetitors);

  return normalizedDomains.length > 0 ? normalizedDomains : [""];
}

export function mergeOnboardingPrefilledCompetitorDomains(
  currentDomains: string[],
  suggestedDomains: string[],
  maxCompetitors = ONBOARDING_MAX_COMPETITORS,
) {
  const normalizedSuggestions = normalizeCompetitorDomains(
    suggestedDomains,
    maxCompetitors,
  );

  if (normalizedSuggestions.length === 0) {
    return buildInitialOnboardingCompetitorDomains(currentDomains, maxCompetitors);
  }

  const mergedDomains = buildInitialOnboardingCompetitorDomains(
    currentDomains,
    maxCompetitors,
  ).slice(0, maxCompetitors);
  const currentNonEmptyDomains = mergedDomains.filter(
    (domain) => domain.trim().length > 0,
  );

  if (currentNonEmptyDomains.length === 0) {
    return normalizedSuggestions;
  }

  const seenDomains = new Set(
    currentNonEmptyDomains.map((domain) => domain.trim().toLowerCase()),
  );

  for (const domain of normalizedSuggestions) {
    const normalizedDomain = domain.trim().toLowerCase();

    if (seenDomains.has(normalizedDomain)) {
      continue;
    }

    const emptyIndex = mergedDomains.findIndex((value) => value.trim().length === 0);

    if (emptyIndex >= 0) {
      mergedDomains[emptyIndex] = domain;
    } else if (mergedDomains.length < maxCompetitors) {
      mergedDomains.push(domain);
    } else {
      break;
    }

    seenDomains.add(normalizedDomain);
  }

  return mergedDomains;
}

function normalizeCompetitorDomains(domains: string[], maxCompetitors: number) {
  return domains
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)
    .slice(0, maxCompetitors);
}
