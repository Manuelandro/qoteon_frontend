import Link from "next/link";

import { MarketingHeader } from "@/app/marketing-header";

const pricingPlans = [
  {
    title: "Trial",
    price: "Free",
    description:
      "3 days of product compute, 1 domain, 3 competitors, 3 models, 5 tracked prompts daily, and tightly capped crawl and generation quotas.",
  },
  {
    title: "Starter",
    price: "EUR 99",
    description:
      "1 domain, 3 competitors, 3 tracked models, 20 tracked prompts daily, 1,350 LLM responses monthly, and 3 months of retention.",
  },
  {
    title: "Growth",
    price: "EUR 199",
    description:
      "3 domains, 6 competitors, 4 tracked models, 50 tracked prompts daily, 6,000 LLM responses monthly, and 12 months of retention.",
  },
  {
    title: "Enterprise",
    price: "Custom",
    description:
      "5 domains, 10 competitors, 5 tracked models, 150 tracked prompts daily, 22,500 LLM responses monthly, and 4 months of retention.",
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
            Every self-serve account starts on a short trial. Upgrade into Starter, Growth, or
            Enterprise when you need more domains, prompts, models, retention, and monthly quota.
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
                  {plan.price === "Custom" ? "contact us" : plan.price === "Free" ? "3-day trial" : "per month"}
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
              Start on the trial, then move into the plan that matches your tracking and crawl volume.
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
