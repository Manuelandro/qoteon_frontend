"use client";

import { useActionState, useState } from "react";

import { signIn, signUp, type AuthFormState } from "@/app/auth/actions";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

const initialState: AuthFormState = undefined;

type AuthFormProps = {
  initialOAuthError?: string;
  redirectTo: string;
};

type FormNoticeProps = {
  state: AuthFormState;
};

function FormNotice({ state }: FormNoticeProps) {
  if (!state?.error && !state?.success) {
    return null;
  }

  const tone = state.error
    ? "border-rose-500/20 bg-rose-500/10 text-rose-800"
    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-800";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${tone}`}>
      {state.error ?? state.success}
    </p>
  );
}

type AuthInputProps = {
  autoComplete: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "email" | "password" | "text";
};

function AuthInput({
  autoComplete,
  label,
  name,
  placeholder,
  type = "text",
}: AuthInputProps) {
  return (
    <label className="grid gap-2 text-sm text-black/62">
      <span className="font-medium text-black">{label}</span>
      <input
        autoComplete={autoComplete}
        className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base text-black outline-none transition placeholder:text-black/35 focus:border-black/20"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 18 18">
      <path
        d="M17.64 9.2c0-.64-.06-1.26-.16-1.85H9v3.5h4.84a4.15 4.15 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.87 2.68-6.63Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.26c-.8.54-1.84.87-3.04.87-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96 10.73A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.73V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.06l3-2.33Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.42 1.35l2.57-2.57A8.95 8.95 0 0 0 9 0 9 9 0 0 0 .96 4.94l3 2.33C4.67 5.15 6.66 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm({ initialOAuthError, redirectTo }: AuthFormProps) {
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);
  const [oauthError, setOauthError] = useState(initialOAuthError);
  const [googlePending, setGooglePending] = useState(false);

  async function handleGoogleAuth() {
    setOauthError(undefined);
    setGooglePending(true);

    const supabase = createSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setOauthError(error.message);
      setGooglePending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(13,18,26,0.92),rgba(57,43,28,0.68))] p-8 shadow-[0_24px_90px_rgba(10,12,16,0.35)]">
        <p className="text-sm uppercase tracking-[0.22em] text-white/55">
          Private access
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.04em] text-white sm:text-5xl">
          Supabase authentication is now the gate for the Algome restricted area.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
          Sign in with an existing account or create one directly here. The
          protected route is validated both before rendering and during the
          request lifecycle.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-white">SSR cookies</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Supabase auth state is stored in cookies that server actions can update.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-white">Proxy guard</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              `proxy.ts` refreshes the session and blocks unauthenticated access.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-white">Server checks</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              The restricted layout still verifies the active user before it renders.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <form
          action={signInAction}
          className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(17,17,17,0.08)]"
        >
          <input name="redirectTo" type="hidden" value={redirectTo} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-black">Sign in</p>
              <p className="mt-1 text-sm text-black/55">
                Use an existing Supabase account.
              </p>
            </div>
            <p className="rounded-full border border-black/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/45">
              Live
            </p>
          </div>
          <div className="mt-6 grid gap-4">
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:border-black/20 disabled:cursor-not-allowed disabled:text-black/40"
              disabled={googlePending}
              onClick={() => void handleGoogleAuth()}
              type="button"
            >
              <GoogleIcon />
              {googlePending ? "Redirecting to Google..." : "Continue with Google"}
            </button>
            {oauthError ? (
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800">
                {oauthError}
              </p>
            ) : null}
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-black/35">
              <span className="h-px flex-1 bg-black/10" />
              <span>Email and password</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>
            <AuthInput
              autoComplete="email"
              label="Email"
              name="email"
              placeholder="founder@company.com"
              type="email"
            />
            <AuthInput
              autoComplete="current-password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              type="password"
            />
          </div>
          <div className="mt-4">
            <FormNotice state={signInState} />
          </div>
          <button
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/55"
            disabled={signInPending}
            type="submit"
          >
            {signInPending ? "Signing in..." : "Access restricted area"}
          </button>
        </form>

        <form
          action={signUpAction}
          className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] p-6 shadow-[0_18px_60px_rgba(17,17,17,0.05)]"
        >
          <input name="redirectTo" type="hidden" value={redirectTo} />
          <div>
            <p className="text-lg font-semibold text-black">Create account</p>
            <p className="mt-1 text-sm text-black/55">
              Supabase Auth creates the user, then first access onboarding collects the company context.
            </p>
          </div>
          <div className="mt-6 grid gap-4">
            <AuthInput
              autoComplete="name"
              label="Full name"
              name="fullName"
              placeholder="Jane Smith"
            />
            <AuthInput
              autoComplete="email"
              label="Work email"
              name="email"
              placeholder="team@brand.com"
              type="email"
            />
            <AuthInput
              autoComplete="new-password"
              label="Password"
              name="password"
              placeholder="Minimum 8 characters"
              type="password"
            />
          </div>
          <div className="mt-4">
            <FormNotice state={signUpState} />
          </div>
          <button
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black transition hover:border-black/20 disabled:cursor-not-allowed disabled:text-black/40"
            disabled={signUpPending}
            type="submit"
          >
            {signUpPending ? "Creating account..." : "Create Supabase account"}
          </button>
        </form>
      </div>
    </div>
  );
}
