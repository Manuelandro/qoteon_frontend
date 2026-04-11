import { redirect } from "next/navigation";

import { getOnboardingState } from "@/utils/core/workspace";

export default async function OnboardingIndexPage() {
  const state = await getOnboardingState();

  redirect(state.isOnboardingComplete ? "/restricted" : state.nextStep);
}
