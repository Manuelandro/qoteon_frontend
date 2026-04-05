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
  const user = await getAuthenticatedUser();
  const profile = await getCurrentUserProfile();

  if (!user || !profile) {
    return null;
  }

  const provider = user.app_metadata.provider ?? "email";

  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">
          Access granted
        </p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          The first Algome private area is now protected by Supabase authentication.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">
          This page only renders after the active user session has been verified.
          The request is filtered in <code>proxy.ts</code>, the layout checks the
          authenticated user again on the server, and the app reads your linked
          <code> public.profiles </code> row for workspace data.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Profile row
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Full name</p>
              <p className="mt-3 break-all text-lg font-medium text-black">
                {profile.full_name ?? "Not provided"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Company name</p>
              <p className="mt-3 text-lg font-medium text-black">
                {profile.company_name ?? "Not provided"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Email</p>
              <p className="mt-3 break-all text-lg font-medium text-black">
                {profile.email ?? user.email}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Provider</p>
              <p className="mt-3 text-lg font-medium capitalize text-black">
                {provider}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Profile created at</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatDate(profile.created_at)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5">
              <p className="text-sm text-black/45">Last profile sync</p>
              <p className="mt-3 text-lg font-medium text-black">
                {formatDate(profile.updated_at)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-black/38">
            Auth + profile model
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-7 text-black/62">
            <li className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              Supabase Auth owns credentials and sessions, while <code>public.profiles</code> holds app-specific data.
            </li>
            <li className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              New signups send <code>full_name</code> and <code>company_name</code> as user metadata, and the database trigger copies them into the profile row.
            </li>
            <li className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-4">
              From here you can extend <code>public.profiles</code> or add related workspace tables without changing auth.
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
