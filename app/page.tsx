import Link from "next/link";

import { HomeChatPreview } from "@/app/home-chat-preview";
import { MarketingHeader } from "@/app/marketing-header";

const process = [
  {
    title: "Measure",
    description:
      "We map how your brand currently shows up in chatbot answers and where competitors win attention.",
  },
  {
    title: "Prioritize",
    description:
      "We identify the topics, entities, and content signals most likely to influence recommendation quality.",
  },
  {
    title: "Improve",
    description:
      "Your team uses the platform, or ours executes the work end to end and reports on momentum over time.",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <MarketingHeader currentPath="/" />

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm tracking-[0.22em] text-black/45 uppercase">
              Brand presence for the AI era
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-none tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
              Help your brand appear inside the answers people trust.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/62 sm:text-xl">
              Qoteon helps companies grow visibility inside ChatGPT, Gemini,
              Claude, and other LLM chatbots. Use our software to guide your
              own team, or hand the full workflow to ours.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
                href="/pricing"
              >
                See Pricing
              </Link>
              <a
                href="#process"
                className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
              >
                How It Works
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-black/8 bg-[var(--surface)] p-8 shadow-[0_20px_70px_rgba(17,17,17,0.06)] backdrop-blur-sm">
            <p className="text-xs tracking-[0.2em] text-black/40 uppercase">
              Built for modern growth teams
            </p>
            <HomeChatPreview />
          </aside>
        </section>

        <section
          id="process"
          className="rounded-[2.25rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10 sm:py-10"
        >
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.2em] text-black/40 uppercase">
              How it works
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
              A concise system for earning more presence in AI-generated
              answers.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {process.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-black/8 bg-white/80 p-6"
              >
                <p className="text-sm tracking-[0.18em] text-black/36 uppercase">
                  {`0${index + 1}`}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-black">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-black/62">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-[2rem] border border-black/8 bg-white px-7 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.2em] text-black/40 uppercase">
              Platform access is now live
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-black">
              Start with software, scale with a team, and step into the first
              protected Qoteon workspace.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
              href="/pricing"
            >
              Explore pricing
            </Link>
            <Link
              className="inline-flex w-fit rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
              href="/restricted"
            >
              Open restricted area
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
