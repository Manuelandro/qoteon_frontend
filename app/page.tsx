import Link from "next/link";

const offers = [
  {
    title: "Software Platform",
    price: "$99",
    description:
      "A focused workspace for teams that want to grow how often and how well their brand appears in LLM answers.",
    points: [
      "Track visibility across major chatbots",
      "Spot themes, gaps, and brand mentions",
      "Turn AI search insight into execution priorities",
    ],
  },
  {
    title: "Managed Growth Package",
    price: "$2199",
    description:
      "A dedicated Algome team that handles strategy, implementation, and continuous optimization on your behalf.",
    points: [
      "AI visibility audit and roadmap",
      "Hands-on execution with ongoing reporting",
      "Continuous refinement to expand brand presence",
    ],
  },
];

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
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-5">
          <Link href="/" className="text-sm font-semibold tracking-[0.24em] uppercase">
            Algome
          </Link>
          <div className="flex flex-wrap gap-3">
            <a
              href="#offers"
              className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
            >
              Explore Offers
            </a>
            <Link
              href="/login"
              className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm tracking-[0.22em] text-black/45 uppercase">
              Brand presence for the AI era
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-none tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
              Help your brand appear inside the answers people trust.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/62 sm:text-xl">
              Algome helps companies grow visibility inside ChatGPT, Gemini,
              Claude, and other LLM chatbots. Use our software to guide your
              own team, or hand the full workflow to ours.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#offers"
                className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
              >
                View Solutions
              </a>
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
            <div className="mt-8 space-y-6">
              <div className="border-b border-black/8 pb-6">
                <p className="text-3xl font-serif leading-none">01</p>
                <p className="mt-3 text-base leading-7 text-black/65">
                  Understand how your company is represented across AI answers.
                </p>
              </div>
              <div className="border-b border-black/8 pb-6">
                <p className="text-3xl font-serif leading-none">02</p>
                <p className="mt-3 text-base leading-7 text-black/65">
                  Improve the signals that influence whether your brand gets
                  surfaced and recommended.
                </p>
              </div>
              <div>
                <p className="text-3xl font-serif leading-none">03</p>
                <p className="mt-3 text-base leading-7 text-black/65">
                  Keep compounding visibility with ongoing monitoring and
                  iteration.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section
          id="offers"
          className="grid gap-5 lg:grid-cols-2"
          aria-label="Algome offers"
        >
          {offers.map((offer) => (
            <article
              key={offer.title}
              className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]"
            >
              <p className="text-sm tracking-[0.18em] text-black/38 uppercase">
                {offer.title}
              </p>
              <div className="mt-5 flex items-end gap-2">
                <p className="font-serif text-5xl leading-none tracking-[-0.04em] text-black">
                  {offer.price}
                </p>
                <p className="pb-1 text-sm text-black/50">per month</p>
              </div>
              <p className="mt-4 max-w-xl font-serif text-3xl leading-tight tracking-[-0.03em] text-black">
                {offer.description}
              </p>
              <ul className="mt-8 space-y-3 text-sm leading-7 text-black/62">
                {offer.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 border-t border-black/6 pt-3"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-black/70" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
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
              protected Algome workspace.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href="/login"
              className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
            >
              Sign in with Supabase
            </Link>
            <Link
              href="/restricted"
              className="inline-flex w-fit rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
            >
              Open restricted area
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
