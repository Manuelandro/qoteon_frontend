import { getWorkspaceState } from "@/utils/core/workspace";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const metadata = {
  title: "Competitors | Qoteon",
  description: "Competitor workspace for Qoteon.",
};

export default async function CompetitorsPage() {
  const state = await getWorkspaceState();
  const competitors = state.competitors;

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">Competitors</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          Keep the domains you want to measure yourself against in one place.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          These Core-owned competitor records define the comparison set for future
          visibility benchmarks, citation overlap, and prompt-level competitive tracking.
        </p>
      </section>

      <section className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-black/38">
              Current list
            </p>
            <p className="mt-2 text-sm text-black/52">
              {competitors.length} tracked {competitors.length === 1 ? "domain" : "domains"}
            </p>
          </div>
          <p className="rounded-full border border-black/8 px-4 py-2 text-sm text-black/60">
            Core-backed list
          </p>
        </div>

        <div className="mt-8 grid gap-3">
          {competitors.length > 0 ? (
            competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5"
              >
                <p className="font-medium text-black">{competitor.competitor_name}</p>
                <p className="mt-2 text-sm text-black/55">{competitor.competitor_domain}</p>
                <p className="mt-2 text-sm text-black/45">
                  Added {formatDate(competitor.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[var(--surface)] p-6">
              <p className="text-sm leading-7 text-black/62">
                No competitors are stored yet. Complete the onboarding flow to seed the
                first benchmark set.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
