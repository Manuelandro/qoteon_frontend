"use client";

import { useActionState } from "react";

import { saveCompanyDetails, type OnboardingFormState } from "@/app/restricted/onboarding/actions";

const initialState: OnboardingFormState = undefined;

export function CompanyForm() {
  const [state, action, pending] = useActionState(saveCompanyDetails, initialState);

  return (
    <form
      action={action}
      className="grid gap-6 rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)] sm:px-10"
    >
      <label className="grid gap-2 text-sm text-black/62">
        <span className="font-medium text-black">Company name</span>
        <input
          className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base text-black outline-none placeholder:text-black/35 focus:border-black/20"
          name="companyName"
          placeholder="Acme Inc."
          required
          type="text"
        />
      </label>

      <label className="grid gap-2 text-sm text-black/62">
        <span className="font-medium text-black">Website URL</span>
        <input
          className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base text-black outline-none placeholder:text-black/35 focus:border-black/20"
          name="websiteUrl"
          placeholder="https://acme.com"
          required
          type="text"
        />
      </label>

      <label className="grid gap-2 text-sm text-black/62">
        <span className="font-medium text-black">Brief description</span>
        <textarea
          className="min-h-40 rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-base text-black outline-none placeholder:text-black/35 focus:border-black/20"
          name="description"
          placeholder="Describe what the company does, who it serves, and what category it competes in."
          required
        />
      </label>

      {state?.error ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/55"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving progress..." : "Continue to competitors"}
      </button>
    </form>
  );
}
