import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getCurrentUserProfile } from "@/utils/supabase/profile";
import { requireAuthenticatedUser } from "@/utils/supabase/server";

export default async function RestrictedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuthenticatedUser("/restricted");
  const profile = await getCurrentUserProfile();
  const displayName = profile?.full_name ?? user.email;

  return (
    <div className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <header className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-6 shadow-[0_18px_60px_rgba(17,17,17,0.04)] backdrop-blur-sm sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-black/40">
              Restricted area
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-none tracking-[-0.04em] text-black">
              Algome workspace
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

        {children}
      </div>
    </div>
  );
}
