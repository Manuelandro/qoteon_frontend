import Link from "next/link";

import { MarketingHeader } from "@/app/marketing-header";

const pricingPlans = [
  {
    title: "Software Starter",
    price: "$69",
    description: "For early-stage teams.",
  },
  {
    title: "Software Pro",
    price: "$149",
    description: "For growing in-house teams.",
  },
  {
    title: "Software Max",
    price: "$399",
    description: "For advanced operating needs.",
  },
  {
    title: "Managed Enterprise",
    price: "Custom",
    description: "For full-service execution.",
  },
] as const;

export const metadata = {
  title: "Pricing | Qoteon",
  description: "Software and managed pricing for Qoteon.",
};

export default function PricingPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <MarketingHeader currentPath="/pricing" />

        <section className="max-w-4xl">
          <p className="text-sm tracking-[0.22em] text-black/45 uppercase">Pricing</p>
          <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.04em] text-black sm:text-6xl">
            Choose the Qoteon plan that fits how you want to operate.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/62 sm:text-xl">
            Start with software if your team wants direct access to the platform,
            or move to a managed engagement when you want Qoteon to drive the work.
          </p>
        </section>

        <section
          aria-label="Pricing plans"
          className="grid gap-5 lg:grid-cols-2"
        >
          {pricingPlans.map((plan) => (
            <article
              key={plan.title}
              className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]"
            >
              <p className="text-sm tracking-[0.18em] text-black/38 uppercase">
                {plan.title}
              </p>
              <div className="mt-5 flex items-end gap-2">
                <p className="font-serif text-5xl leading-none tracking-[-0.04em] text-black">
                  {plan.price}
                </p>
                <p className="pb-1 text-sm text-black/50">
                  {plan.price === "Custom" ? "contact us" : "per month"}
                </p>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-black/58">
                {plan.description}
              </p>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-6 rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.2em] text-black/40 uppercase">
              Next step
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-black">
              Pick a software tier or talk with us about a managed enterprise setup.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex w-fit rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
              href="/"
            >
              Back to landing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
