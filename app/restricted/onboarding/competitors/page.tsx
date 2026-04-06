import { redirect } from "next/navigation";

import { CompetitorsForm } from "@/app/restricted/onboarding/competitors/competitors-form";
import { getOnboardingState } from "@/utils/supabase/company";

export default async function CompetitorsOnboardingPage() {
  const state = await getOnboardingState();

  if (!state.requiresFirstAccessSetup) {
    redirect("/restricted");
  }

  if (!state.isCompanyComplete) {
    redirect("/restricted/onboarding/company");
  }

  if (state.isCompetitorsComplete) {
    redirect("/restricted");
  }

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">Step 2 of 2</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          Add the competitor domains that matter most in your market.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          Start with the sites that show up most often in deals, searches, or category
          conversations against {state.companyContext?.name}. You can add more later.
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
              <p className="text-black/45">What to add</p>
              <p className="mt-2 text-black/62">
                Enter root competitor domains such as <code>example.com</code> or paste
                a full URL and we will normalize it.
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
              companyDescription={state.companyContext?.description ?? ""}
              companyDomain={state.companyContext?.website_url ?? ""}
              companyName={state.companyContext?.name ?? ""}
              initialDomains={state.competitors.map((competitor) => competitor.domain)}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
