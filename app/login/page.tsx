import Link from "next/link";

import { AuthForm } from "@/app/login/auth-form";
import { getSafeRedirectPath } from "@/utils/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    oauthError?: string | string[];
    redirectTo?: string | string[];
  }>;
};

export const metadata = {
  title: "Sign in | Algome",
  description: "Authenticate with Supabase to access the restricted Algome area.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { oauthError, redirectTo } = await searchParams;

  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 pb-5">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.24em]"
            href="/"
          >
            Algome
          </Link>
          <Link
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
            href="/"
          >
            Back to landing
          </Link>
        </header>

        <AuthForm
          initialOAuthError={typeof oauthError === "string" ? oauthError : undefined}
          redirectTo={getSafeRedirectPath(redirectTo)}
        />
      </div>
    </main>
  );
}
