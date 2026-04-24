"use server";

import { redirect } from "next/navigation";

import { clearCompanyDraft, getCompanyDraft, setCompanyDraft } from "@/utils/company-draft";
import { normalizeDomain, normalizeWebsiteUrl } from "@/utils/company";
import {
  sanitizeLanguages,
  validateAndSanitizeRegions,
} from "@/utils/company-profile-options";
import { ONBOARDING_MAX_COMPETITORS } from "@/utils/core/competitor-limits";
import { CoreApiError } from "@/utils/core/client";
import { buildOnboardingDashboardHref } from "@/utils/core/project-onboarding";
import { getOnboardingState, provisionCoreProjectFromOnboarding } from "@/utils/core/workspace";
import { getAuthenticatedUser } from "@/utils/supabase/server";

export type OnboardingFormState =
  | {
      error?: string;
    }
  | undefined;

function getStringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getStringValues(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function getOnboardingErrorMessage(error: unknown) {
  if (error instanceof CoreApiError) {
    if (error.status === 401) {
      return "Your session expired before Qoteon could reach Core. Sign in again and retry.";
    }

    if (error.status === 403) {
      return "Core denied access to the organization or project for this onboarding flow.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the Core project setup.";
}

export async function saveCompanyDetails(
  _previousState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  if (!(await getAuthenticatedUser())) {
    redirect("/login");
  }

  const name = getStringValue(formData, "companyName");
  const websiteInput = getStringValue(formData, "websiteUrl");
  const category = getStringValue(formData, "category");
  const regionMode = getStringValue(formData, "regionMode");
  const rawRegions = getStringValues(formData, "regions");
  const regionSelection = validateAndSanitizeRegions(rawRegions);
  const languages = sanitizeLanguages(getStringValues(formData, "languages"));

  if (!name || !websiteInput || !category) {
    return {
      error: "Company name, website URL, and category are required.",
    };
  }

  const websiteUrl = normalizeWebsiteUrl(websiteInput);

  if (!websiteUrl) {
    return {
      error: "Enter a valid company website URL.",
    };
  }

  if (
    !regionSelection.isValid ||
    regionSelection.regions.length === 0 ||
    (regionMode !== "worldwide" && rawRegions.length === 0)
  ) {
    return {
      error: "Select Worldwide, one or more continents, or one or more countries.",
    };
  }

  if (getStringValues(formData, "languages").length === 0) {
    return {
      error: "Select at least one language.",
    };
  }

  await setCompanyDraft({
    category,
    region: regionSelection.regions,
    languages,
    name,
    website_url: websiteUrl,
  });

  redirect("/restricted/onboarding/competitors");
}

export async function saveCompetitors(
  _previousState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  if (!(await getAuthenticatedUser())) {
    redirect("/login");
  }

  const [companyDraft, onboardingState] = await Promise.all([
    getCompanyDraft(),
    getOnboardingState(),
  ]);

  const companyContext = companyDraft ?? onboardingState.companyContext;

  if (!companyContext) {
    redirect("/restricted/onboarding/company");
  }

  const normalizedDomains = Array.from(
    new Set(
      formData
        .getAll("domains")
        .map((value) => normalizeDomain(String(value ?? "")))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (normalizedDomains.length === 0) {
    return {
      error: "Add at least one competitor domain to continue.",
    };
  }

  if (normalizedDomains.length > ONBOARDING_MAX_COMPETITORS) {
    return {
      error: `You can track up to ${ONBOARDING_MAX_COMPETITORS} competitors on this plan.`,
    };
  }

  let result: Awaited<ReturnType<typeof provisionCoreProjectFromOnboarding>>;

  try {
    result = await provisionCoreProjectFromOnboarding({
      company: companyContext,
      competitorDomains: normalizedDomains,
    });
  } catch (error) {
    return {
      error: getOnboardingErrorMessage(error),
    };
  }

  await clearCompanyDraft();
  redirect(buildOnboardingDashboardHref(result.project.id));
}
