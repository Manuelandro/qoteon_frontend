"use server";

import { redirect } from "next/navigation";

import { clearCompanyDraft, getCompanyDraft, setCompanyDraft } from "@/utils/company-draft";
import { normalizeDomain, normalizeWebsiteUrl } from "@/utils/company";
import { sanitizeCountry, sanitizeLanguages } from "@/utils/company-profile-options";
import { getCurrentCompany } from "@/utils/supabase/company";
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
  const [company, companyDraft] = await Promise.all([getCurrentCompany(), getCompanyDraft()]);

  if (!profile) {
    redirect("/login");
  }

  const companyContext =
    companyDraft ??
    (company
      ? {
          category: company.category,
          country: company.country,
          languages: company.languages,
          name: company.name,
          website_url: company.website_url,
        }
      : null);

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

  const supabase = await createSupabaseServerClient();
  const { data: persistedCompany, error: companyError } = await supabase
    .from("company")
    .upsert(
      {
        profile_id: profile.id,
        name: companyContext.name,
        website_url: companyContext.website_url,
        description: companyContext.category,
        category: companyContext.category,
        country: companyContext.country,
        languages: companyContext.languages,
      },
      {
        onConflict: "profile_id",
      },
    )
    .select("id")
    .single();

  if (companyError || !persistedCompany) {
    return {
      error: companyError?.message ?? "Failed to save company details.",
    };
  }

  const { error: competitorsError } = await supabase.from("competitors").upsert(
    normalizedDomains.map((domain) => ({
      owner_id: profile.id,
      company_id: persistedCompany.id,
      domain,
      normalized_domain: domain,
      source: "manual" as const,
    })),
    {
      onConflict: "company_id,normalized_domain",
    },
  );

  if (competitorsError) {
    return {
      error: competitorsError.message,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ first_access: false })
    .eq("id", profile.id);

  if (profileError) {
    return {
      error: profileError.message,
    };
  }

  await clearCompanyDraft();

  redirect("/restricted");
}
