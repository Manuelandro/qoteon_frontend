import { redirect } from "next/navigation";

import { CompanyForm } from "@/app/restricted/onboarding/company/company-form";
import { getOnboardingState } from "@/utils/supabase/company";

export default async function CompanyOnboardingPage() {
  const state = await getOnboardingState();

  if (!state.requiresFirstAccessSetup) {
    redirect("/restricted");
  }

  if (state.isCompanyComplete) {
    redirect(state.isCompetitorsComplete ? "/restricted" : "/restricted/onboarding/competitors");
  }

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">Step 1 of 2</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          Tell Algome about the company you want to track.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          Before entering the workspace, we need the company context that will anchor
          visibility monitoring, prompt tracking, and competitor analysis.
        </p>
      </section>

      <CompanyForm />
    </main>
  );
}
