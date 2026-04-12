import { getAuthenticatedUser } from "@/utils/supabase/server";
import {
  getOnboardingState,
  prepareOnboardingCompetitorPrefill,
} from "@/utils/core/workspace";
import { ONBOARDING_MAX_COMPETITORS } from "@/utils/core/competitor-limits";

function toDomainList(domains: string[]) {
  return domains
    .filter((value) => value.trim().length > 0)
    .slice(0, ONBOARDING_MAX_COMPETITORS);
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getOnboardingState();

  if (!state.requiresFirstAccessSetup) {
    return Response.json(
      { error: "Onboarding competitor prefills are only available during first access." },
      { status: 403 },
    );
  }

  if (!state.companyContext) {
    return Response.json(
      { error: "Company details must be completed before competitor prefills can start." },
      { status: 400 },
    );
  }

  return Response.json({
    competitors: toDomainList(
      state.competitors.map((competitor) => competitor.competitor_domain),
    ),
  });
}

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getOnboardingState();

  if (!state.requiresFirstAccessSetup) {
    return Response.json(
      { error: "Onboarding competitor prefills are only available during first access." },
      { status: 403 },
    );
  }

  const companyContext = state.companyContext;

  if (!companyContext) {
    return Response.json(
      { error: "Company details must be completed before competitor prefills can start." },
      { status: 400 },
    );
  }

  try {
    const prefillState = await prepareOnboardingCompetitorPrefill(companyContext);

    return Response.json({
      competitors: toDomainList(
        prefillState.competitors.map((competitor) => competitor.competitor_domain),
      ),
      source: prefillState.source,
      warnings: prefillState.warnings,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate onboarding competitor prefills.",
      },
      { status: 500 },
    );
  }
}
