type WorkspaceSectionShellProps = {
  description: string;
  eyebrow: string;
  highlights: [string, string, string];
  title: string;
};

export function WorkspaceSectionShell({
  description,
  eyebrow,
  highlights,
  title,
}: WorkspaceSectionShellProps) {
  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f5ef] px-7 py-8 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-black/40">{eyebrow}</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-black/62">{description}</p>
      </section>

      <section className="rounded-[2rem] border border-black/8 bg-white px-7 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
        <p className="text-sm uppercase tracking-[0.18em] text-black/38">Planned surface</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[1.5rem] border border-black/8 bg-[var(--surface)] p-5"
            >
              <p className="text-sm leading-7 text-black/72">{highlight}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
