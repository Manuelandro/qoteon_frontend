import { redirect } from "next/navigation";

import { getOnboardingState } from "@/utils/supabase/company";

export default async function OnboardingIndexPage() {
  const state = await getOnboardingState();

  redirect(state.requiresFirstAccessSetup ? state.nextStep : "/restricted");
}
