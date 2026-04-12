import "server-only";

import { cache } from "react";

import type { CompanyDraft } from "@/utils/company-draft";
import { getCompanyDraft } from "@/utils/company-draft";
import { normalizeDomain } from "@/utils/company";
import { sanitizeRegions } from "@/utils/company-profile-options";
import { ONBOARDING_MAX_COMPETITORS } from "@/utils/core/competitor-limits";
import type {
  CoreOrganization,
  CoreProject,
  CoreCompetitorPrefillResult,
  CoreProjectCompetitor,
  CoreProjectOverview,
  CorePromptContext,
  CoreSetupProjectResult,
} from "@/utils/core/client";
import {
  bootstrapCoreProjectCompetitors,
  createCoreOrganization,
  createCoreProject,
  createCoreProjectCompetitor,
  deleteCoreProjectCompetitor,
  getCoreProjectOverview,
  getCoreProjectPromptContext,
  listCoreOrganizations,
  listCoreProjectCompetitors,
  listCoreProjects,
  prefillCoreProjectCompetitors,
} from "@/utils/core/client";
import type { Profile } from "@/utils/supabase/profile";
import { getCurrentUserProfile } from "@/utils/supabase/profile";

export type CompanyContext = {
  category: string;
  region: string[];
  languages: string[];
  name: string;
  website_url: string;
};

export type WorkspaceState = {
  profile: Profile | null;
  organization: CoreOrganization | null;
  project: CoreProject | null;
  competitors: CoreProjectCompetitor[];
  promptContext: CorePromptContext | null;
  overview: CoreProjectOverview | null;
  companyDraft: CompanyDraft | null;
  companyContext: CompanyContext | null;
  isCompanyComplete: boolean;
  isCompetitorsComplete: boolean;
  isOnboardingComplete: boolean;
  nextStep: "/restricted" | "/restricted/onboarding/company" | "/restricted/onboarding/competitors";
  requiresFirstAccessSetup: boolean;
};

type ProvisionProjectInput = {
  company: CompanyDraft;
  competitorDomains: string[];
};

export type OnboardingCompetitorPrefillState = {
  organization: CoreOrganization;
  project: CoreProject;
  competitors: CoreProjectCompetitor[];
  warnings: CoreCompetitorPrefillResult["warnings"];
  source: CoreCompetitorPrefillResult["source"];
};

export const getWorkspaceState = cache(async (): Promise<WorkspaceState> => {
  const [profile, companyDraft, organizations, projects] = await Promise.all([
    getCurrentUserProfile(),
    getCompanyDraft(),
    listCoreOrganizations(),
    listCoreProjects(),
  ]);
  const project = selectPrimaryProject(projects);
  const organization = selectPrimaryOrganization(organizations, project);
  const competitors = project ? await listCoreProjectCompetitors(project.id) : [];
  const { overview, promptContext } = project
    ? await loadOptionalProjectReads(project.id)
    : {
        overview: null,
        promptContext: null,
      };
  const companyContext = project ? mapProjectToCompanyContext(project) : companyDraft;
  const isCompanyComplete = Boolean(companyContext);
  const isCompetitorsComplete = competitors.length > 0;
  const requiresFirstAccessSetup = profile?.first_access ?? false;
  const isOnboardingComplete = Boolean(project) && !requiresFirstAccessSetup;
  const nextStep = !isCompanyComplete
    ? "/restricted/onboarding/company"
    : requiresFirstAccessSetup
      ? "/restricted/onboarding/competitors"
      : "/restricted";

  return {
    profile,
    organization,
    project,
    competitors,
    promptContext,
    overview,
    companyDraft,
    companyContext,
    isCompanyComplete,
    isCompetitorsComplete,
    isOnboardingComplete,
    nextStep,
    requiresFirstAccessSetup,
  };
});

export const getOnboardingState = getWorkspaceState;

export async function provisionCoreProjectFromOnboarding(
  input: ProvisionProjectInput,
): Promise<{
  organization: CoreOrganization;
  project: CoreProject;
  competitors: CoreProjectCompetitor[];
  setupResult: CoreSetupProjectResult | null;
}> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("An authenticated user profile is required before onboarding.");
  }

  const state = await getWorkspaceState();
  const companyDomain = normalizeDomain(input.company.website_url);

  if (!companyDomain) {
    throw new Error("Enter a valid company website URL.");
  }

  const normalizedCompetitorDomains = dedupeCompetitorDomains(input.competitorDomains);

  if (normalizedCompetitorDomains.length === 0) {
    throw new Error("Add at least one competitor domain to continue.");
  }

  if (normalizedCompetitorDomains.length > ONBOARDING_MAX_COMPETITORS) {
    throw new Error(
      `You can track up to ${ONBOARDING_MAX_COMPETITORS} competitors on this plan.`,
    );
  }

  const organization =
    state.organization ?? (await createOrganizationForOnboarding(input.company, profile.id));

  if (state.project) {
    const projectId = state.project.id;
    const existingCompetitorsByDomain = new Map(
      state.competitors.map((competitor) => [competitor.competitor_domain, competitor]),
    );
    const competitorsToDelete = state.competitors.filter(
      (competitor) => !normalizedCompetitorDomains.includes(competitor.competitor_domain),
    );
    const domainsToCreate = normalizedCompetitorDomains.filter(
      (domain) => !existingCompetitorsByDomain.has(domain),
    );

    await Promise.all(
      competitorsToDelete.map((competitor) =>
        deleteCoreProjectCompetitor(projectId, competitor.id),
      ),
    );

    const createdCompetitors = await Promise.all(
      domainsToCreate.map((domain) =>
        createCoreProjectCompetitor(projectId, {
          competitor_name: buildCompetitorName(domain),
          competitor_domain: domain,
        }),
      ),
    );
    const keptCompetitors = state.competitors.filter((competitor) =>
      normalizedCompetitorDomains.includes(competitor.competitor_domain),
    );

    if (domainsToCreate.length > 0) {
      await bootstrapCoreProjectCompetitors(projectId);
    }

    return {
      organization,
      project: state.project,
      competitors: sortCompetitorsByDomain([...keptCompetitors, ...createdCompetitors]),
      setupResult: null,
    };
  }

  const setupResult = await createCoreProject({
    organization_id: organization.id,
    name: input.company.name,
    domain: companyDomain,
    company_name: input.company.name,
    primary_category: input.company.category,
    target_region: input.company.region,
    target_language: input.company.languages[0] ?? "English",
    status: "active",
    competitors: normalizedCompetitorDomains.map((domain) => ({
      competitor_name: buildCompetitorName(domain),
      competitor_domain: domain,
    })),
    generate_initial_prompts: false,
  });

  return {
    organization,
    project: setupResult.project,
    competitors: sortCompetitorsByDomain(setupResult.competitors),
    setupResult,
  };
}

export async function prepareOnboardingCompetitorPrefill(
  company: CompanyDraft,
): Promise<OnboardingCompetitorPrefillState> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("An authenticated user profile is required before onboarding.");
  }

  const state = await getWorkspaceState();
  const companyDomain = normalizeDomain(company.website_url);

  if (!companyDomain) {
    throw new Error("Enter a valid company website URL.");
  }

  const organization =
    state.organization ?? (await createOrganizationForOnboarding(company, profile.id));
  const existingProject = state.project;
  const existingCompetitors = sortCompetitorsByDomain(state.competitors);

  if (existingProject && existingCompetitors.length > 0) {
    return {
      organization,
      project: existingProject,
      competitors: existingCompetitors.slice(0, ONBOARDING_MAX_COMPETITORS),
      warnings: [],
      source: "existing",
    };
  }

  const setupResult =
    existingProject ??
    (
      await createCoreProject({
        organization_id: organization.id,
        name: company.name,
        domain: companyDomain,
        company_name: company.name,
        primary_category: company.category,
        target_region: company.region,
        target_language: company.languages[0] ?? "English",
        status: "active",
        generate_initial_prompts: false,
      })
    ).project;

  const prefillResult =
    existingCompetitors.length > 0
      ? {
          source: "existing" as const,
          competitors: existingCompetitors,
          warnings: [],
        }
      : await prefillCoreProjectCompetitors(setupResult.id);

  return {
    organization,
    project: setupResult,
    competitors: sortCompetitorsByDomain(prefillResult.competitors).slice(
      0,
      ONBOARDING_MAX_COMPETITORS,
    ),
    warnings: prefillResult.warnings,
    source: prefillResult.source,
  };
}

export function mapProjectToCompanyContext(project: CoreProject): CompanyContext {
  return {
    category: project.primary_category,
    region: sanitizeRegions(project.target_region),
    languages: [project.target_language],
    name: project.company_name,
    website_url: buildWebsiteUrl(project.domain),
  };
}

async function loadOptionalProjectReads(projectId: string) {
  const [promptContextResult, overviewResult] = await Promise.allSettled([
    getCoreProjectPromptContext(projectId),
    getCoreProjectOverview(projectId),
  ]);

  return {
    promptContext:
      promptContextResult.status === "fulfilled" ? promptContextResult.value : null,
    overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
  };
}

function selectPrimaryOrganization(
  organizations: CoreOrganization[],
  project: CoreProject | null,
) {
  if (project) {
    const matchingOrganization =
      organizations.find((organization) => organization.id === project.organization_id) ?? null;

    if (matchingOrganization) {
      return matchingOrganization;
    }
  }

  return organizations[0] ?? null;
}

function selectPrimaryProject(projects: CoreProject[]) {
  if (projects.length === 0) {
    return null;
  }

  return [...projects].sort((left, right) => {
    const statusRank = getProjectStatusRank(left.status) - getProjectStatusRank(right.status);

    if (statusRank !== 0) {
      return statusRank;
    }

    return toTimestamp(right.updated_at) - toTimestamp(left.updated_at);
  })[0];
}

function getProjectStatusRank(status: CoreProject["status"]) {
  switch (status) {
    case "active":
      return 0;
    case "draft":
      return 1;
    case "paused":
      return 2;
    case "archived":
      return 3;
    default:
      return 4;
  }
}

function buildOrganizationName(company: CompanyDraft) {
  return company.name;
}

async function createOrganizationForOnboarding(company: CompanyDraft, profileId: string) {
  const companyDomain = normalizeDomain(company.website_url);

  if (!companyDomain) {
    throw new Error("Enter a valid company website URL.");
  }

  return createCoreOrganization({
    name: buildOrganizationName(company),
    slug: buildOrganizationSlug(companyDomain, profileId),
    plan_type: "trial",
  });
}

function buildOrganizationSlug(companyDomain: string, profileId: string) {
  return `${companyDomain.replace(/\./g, "-")}-${profileId.slice(0, 8)}`;
}

function buildCompetitorName(domain: string) {
  return domain;
}

function buildWebsiteUrl(domain: string) {
  return /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
}

function dedupeCompetitorDomains(domains: string[]) {
  return Array.from(
    new Set(domains.map((domain) => normalizeDomain(domain ?? "")).filter(Boolean)),
  ) as string[];
}

function sortCompetitorsByDomain(competitors: CoreProjectCompetitor[]) {
  return [...competitors].sort((left, right) =>
    left.competitor_domain.localeCompare(right.competitor_domain),
  );
}

function toTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
