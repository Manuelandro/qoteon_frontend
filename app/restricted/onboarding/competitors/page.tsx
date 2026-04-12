import { redirect } from "next/navigation";

import { CompetitorsForm } from "@/app/restricted/onboarding/competitors/competitors-form";
import { formatRegionSelection } from "@/utils/company-profile-options";
import { ONBOARDING_MAX_COMPETITORS } from "@/utils/core/competitor-limits";
import { getOnboardingState } from "@/utils/core/workspace";

export default async function CompetitorsOnboardingPage() {
  const state = await getOnboardingState();

  if (!state.requiresFirstAccessSetup) {
    redirect("/restricted");
  }

  if (!state.isCompanyComplete) {
    redirect("/restricted/onboarding/company");
  }

  const companyContext = state.companyContext;

  if (!companyContext) {
    redirect("/restricted/onboarding/company");
  }

  const initialDomains = state.competitors
    .map((competitor) => competitor.competitor_domain)
    .slice(0, ONBOARDING_MAX_COMPETITORS);
  const shouldAutoPrefill = Boolean(state.profile?.first_access) && initialDomains.length === 0;

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">Step 2 of 2</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          Add the competitor domains that matter most in your market.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          Start with the sites that show up most often in deals, searches, or category
          conversations against {state.companyContext?.name}. Qoteon preloads up to{" "}
          {ONBOARDING_MAX_COMPETITORS} domains on this plan, and you can swap them before
          finishing setup.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Company context
          </p>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-black/62">
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              <p className="text-black/45">Company</p>
              <p className="mt-2 font-medium text-black">{state.companyContext?.name}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              <p className="text-black/45">Website</p>
              <p className="mt-2 font-medium text-black">{state.companyContext?.website_url}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              <p className="text-black/45">Category</p>
              <p className="mt-2 font-medium text-black">{state.companyContext?.category}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              <p className="text-black/45">Region</p>
              <p className="mt-2 font-medium text-black">
                {formatRegionSelection(state.companyContext?.region ?? ["Worldwide"])}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4 md:col-span-2">
              <p className="text-black/45">Languages</p>
              <p className="mt-2 font-medium text-black">
                {state.companyContext?.languages.join(", ")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4 md:col-span-2">
              <p className="text-black/45">What to add</p>
              <p className="mt-2 text-black/62">
                Enter root competitor domains such as <code>example.com</code> or paste
                a full URL and we will normalize it. Keep the final list to{" "}
                {ONBOARDING_MAX_COMPETITORS} competitors or fewer.
              </p>
            </div>
          </div>
        </article>

        <section className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Competitor list
          </p>
          <div className="mt-6">
            <CompetitorsForm
              initialDomains={initialDomains}
              shouldAutoPrefill={shouldAutoPrefill}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
