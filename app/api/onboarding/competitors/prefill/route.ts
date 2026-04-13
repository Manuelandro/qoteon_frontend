import { getAuthenticatedUser } from "@/utils/supabase/server";
import { CoreApiError } from "@/utils/core/client";
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

function buildPrefillErrorResponse(error: unknown) {
  console.log(error)
  if (error instanceof CoreApiError) {
    const isRecoverablePrefillFailure =
      error.code === "prompt_runner_error" ||
      error.code === "source_intelligence_error" ||
      error.message === "No usable onboarding competitors were generated";

    return Response.json(
      {
        error: isRecoverablePrefillFailure
          ? "Automatic competitor prefill is temporarily unavailable. Add competitor domains manually to continue onboarding."
          : error.message,
        code: error.code,
      },
      { status: error.status },
    );
  }

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

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getOnboardingState();

    if (!state.requiresFirstAccessSetup) {
      console.log("Onboarding competitor prefills are only available during first access.");
      return Response.json(
        { error: "Onboarding competitor prefills are only available during first access." },
        { status: 403 },
      );
    }

    if (!state.companyContext) {
      console.log("Company details must be completed before competitor prefills can start.");
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
  } catch (error) {
    return buildPrefillErrorResponse(error);
  }
}

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getOnboardingState();

    if (!state.requiresFirstAccessSetup) {
      console.log("Onboarding competitor prefills are only available during first access.");
      return Response.json(
        { error: "Onboarding competitor prefills are only available during first access." },
        { status: 403 },
      );
    }

    const companyContext = state.companyContext;

    if (!companyContext) {
      console.log("Company details must be completed before competitor prefills can start.");
      return Response.json(
        { error: "Company details must be completed before competitor prefills can start." },
        { status: 400 },
      );
    }

    const prefillState = await prepareOnboardingCompetitorPrefill(companyContext);

    return Response.json({
      competitors: toDomainList(
        prefillState.competitors.map((competitor) => competitor.competitor_domain),
      ),
      source: prefillState.source,
      warnings: prefillState.warnings,
    });
  } catch (error) {
    return buildPrefillErrorResponse(error);
  }
}
