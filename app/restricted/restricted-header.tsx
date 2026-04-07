import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getCurrentCompany } from "@/utils/supabase/company";
import { getCurrentUserProfile } from "@/utils/supabase/profile";
import { getAuthenticatedUser } from "@/utils/supabase/server";

export async function RestrictedHeader() {
  const user = await getAuthenticatedUser();
  const [profile, company] = await Promise.all([getCurrentUserProfile(), getCurrentCompany()]);

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name ?? user.email;
  const contextLabel =
    company?.name ?? (profile?.first_access ? "First access setup" : "Restricted area");

  return (
    <header className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[0_18px_60px_rgba(17,17,17,0.04)] backdrop-blur-sm sm:flex sm:items-end sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">{contextLabel}</p>
        <h1 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em] text-black">
          Qoteon workspace
        </h1>
        <p className="mt-4 text-sm leading-7 text-black/62">
          Signed in as <span className="font-medium text-black">{displayName}</span>
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 sm:mt-0">
        <Link
          className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
          href="/"
        >
          Landing page
        </Link>
        <form action={signOut}>
          <button
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
