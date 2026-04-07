import "server-only";

import { cache } from "react";

import type { CompanyDraft } from "@/utils/company-draft";
import { getCompanyDraft } from "@/utils/company-draft";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/utils/supabase/profile";

export type Company = {
  category: string;
  country: string;
  languages: string[];
  id: string;
  profile_id: string;
  name: string;
  website_url: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Competitor = {
  id: string;
  owner_id: string;
  company_id: string;
  domain: string;
  normalized_domain: string;
  source: "manual" | "suggested";
  created_at: string;
  updated_at: string;
};

export type CompanyContext = Pick<
  Company,
  "category" | "country" | "languages" | "name" | "website_url"
>;

export type OnboardingState = {
  company: Company | null;
  companyContext: CompanyContext | null;
  companyDraft: CompanyDraft | null;
  competitors: Competitor[];
  isCompanyComplete: boolean;
  isCompetitorsComplete: boolean;
  isOnboardingComplete: boolean;
  nextStep: "/restricted" | "/restricted/onboarding/company" | "/restricted/onboarding/competitors";
  profile: Awaited<ReturnType<typeof getCurrentUserProfile>>;
  requiresFirstAccessSetup: boolean;
};

export const getCurrentCompany = cache(async (): Promise<Company | null> => {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company")
    .select(
      "id, profile_id, name, website_url, description, category, country, languages, created_at, updated_at",
    )
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load company: ${error.message}`);
  }

  return data as Company | null;
});

export const getCurrentCompetitors = cache(async (): Promise<Competitor[]> => {
  const [profile, company] = await Promise.all([getCurrentUserProfile(), getCurrentCompany()]);

  if (!profile || !company) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("competitors")
    .select(
      "id, owner_id, company_id, domain, normalized_domain, source, created_at, updated_at",
    )
    .eq("owner_id", profile.id)
    .eq("company_id", company.id)
    .order("domain", { ascending: true });

  if (error) {
    throw new Error(`Failed to load competitors: ${error.message}`);
  }

  return (data ?? []) as Competitor[];
});

export const getOnboardingState = cache(async (): Promise<OnboardingState> => {
  const [profile, company, competitors, companyDraft] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentCompany(),
    getCurrentCompetitors(),
    getCompanyDraft(),
  ]);

  const requiresFirstAccessSetup = Boolean(profile?.first_access);
  const companyContext =
    companyDraft ??
    (company !== null
      ? {
          category: company.category,
          country: company.country,
          languages: company.languages,
          name: company.name,
          website_url: company.website_url,
        }
      : null);
  const isCompanyComplete = Boolean(companyContext);
  const isCompetitorsComplete = competitors.length > 0;
  const isOnboardingComplete = Boolean(company) && isCompetitorsComplete;
  const nextStep = !isCompanyComplete
    ? "/restricted/onboarding/company"
    : !isCompetitorsComplete
      ? "/restricted/onboarding/competitors"
      : "/restricted";

  return {
    profile,
    company,
    companyDraft,
    companyContext,
    competitors,
    requiresFirstAccessSetup,
    isCompanyComplete,
    isCompetitorsComplete,
    isOnboardingComplete,
    nextStep,
  };
});
