"use server";

import { redirect } from "next/navigation";

import { clearCompanyDraft, getCompanyDraft, setCompanyDraft } from "@/utils/company-draft";
import { normalizeDomain, normalizeWebsiteUrl } from "@/utils/company";
import { sanitizeCountry, sanitizeLanguages } from "@/utils/company-profile-options";
import { CoreApiError } from "@/utils/core/client";
import { getWorkspaceState, provisionCoreProjectFromOnboarding } from "@/utils/core/workspace";
import { getCurrentUserProfile } from "@/utils/supabase/profile";
import { createSupabaseServerClient } from "@/utils/supabase/server";

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
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  const name = getStringValue(formData, "companyName");
  const websiteInput = getStringValue(formData, "websiteUrl");
  const category = getStringValue(formData, "category");
  const countryValue = getStringValue(formData, "country");
  const languages = sanitizeLanguages(getStringValues(formData, "languages"));

  if (!name || !websiteInput || !category) {
    return {
      error: "Company name, website URL, and category are required.",
    };
  }

  const websiteUrl = normalizeWebsiteUrl(websiteInput);
  const country = sanitizeCountry(countryValue);

  if (!websiteUrl) {
    return {
      error: "Enter a valid company website URL.",
    };
  }

  if (getStringValues(formData, "languages").length === 0) {
    return {
      error: "Select at least one language.",
    };
  }

  await setCompanyDraft({
    category,
    country,
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
  const profile = await getCurrentUserProfile();
  const [companyDraft, workspaceState] = await Promise.all([
    getCompanyDraft(),
    getWorkspaceState(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  const companyContext = companyDraft ?? workspaceState.companyContext;

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

  try {
    await provisionCoreProjectFromOnboarding({
      company: companyContext,
      competitorDomains: normalizedDomains,
    });
  } catch (error) {
    return {
      error: getOnboardingErrorMessage(error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ first_access: false })
    .eq("id", profile.id);

  await clearCompanyDraft();

  if (profileError) {
    redirect("/restricted");
  }

  redirect("/restricted");
}
