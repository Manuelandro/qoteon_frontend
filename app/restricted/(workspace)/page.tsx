import { getCurrentCompany, getCurrentCompetitors } from "@/utils/supabase/company";
import { getCurrentUserProfile } from "@/utils/supabase/profile";
import { getAuthenticatedUser } from "@/utils/supabase/server";

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
  title: "Restricted area | Algome",
  description: "Private Algome area protected by Supabase authentication.",
};

export default async function RestrictedPage() {
  const [user, profile, company, competitors] = await Promise.all([
    getAuthenticatedUser(),
    getCurrentUserProfile(),
    getCurrentCompany(),
    getCurrentCompetitors(),
  ]);

  if (!user || !profile || !company) {
    return null;
  }

  const provider = user.app_metadata.provider ?? "email";

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">
          Workspace unlocked
        </p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          The restricted area is available after the first-access company setup is complete.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          Credentials still live in Supabase Auth, <code>public.profiles</code> stores
          the first-access flag and personal app data, while <code>public.company</code>{" "}
          and <code>public.competitors</code> now hold the onboarding context for the
          actual workspace.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Company
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Company name</p>
              <p className="mt-3 text-lg font-medium text-black">{company.name}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Website</p>
              <p className="mt-3 break-all text-lg font-medium text-black">
                {company.website_url}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5 md:col-span-2">
              <p className="text-sm text-black/45">Description</p>
              <p className="mt-3 text-base leading-7 text-black/72">{company.description}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Auth provider</p>
              <p className="mt-3 text-lg font-medium capitalize text-black">{provider}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">First access completed</p>
              <p className="mt-3 text-lg font-medium text-black">
                {profile.first_access ? "No" : "Yes"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Competitors
          </p>
          <div className="mt-8 grid gap-3">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4"
              >
                <p className="font-medium text-black">{competitor.domain}</p>
                <p className="mt-2 text-sm text-black/45">
                  Added {formatDate(competitor.created_at)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
