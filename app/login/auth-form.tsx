"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = undefined;

type AuthFormProps = {
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

export function AuthForm({ redirectTo }: AuthFormProps) {
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

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
              Supabase Auth creates the user, and a linked profile row stores your app data.
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
              autoComplete="organization"
              label="Company name"
              name="companyName"
              placeholder="Acme Inc."
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
