export default function WorkspaceLoading() {
  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-black/8 bg-[#f8f4ec] px-7 py-8 shadow-[0_16px_50px_rgba(17,17,17,0.03)] sm:px-10">
        <div className="h-3 w-24 rounded-full bg-black/8" />
        <div className="mt-5 h-12 w-full max-w-2xl rounded-[1.5rem] bg-black/8" />
        <div className="mt-4 h-5 w-full max-w-3xl rounded-full bg-black/8" />
        <div className="mt-2 h-5 w-full max-w-2xl rounded-full bg-black/8" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.65rem] border border-black/8 bg-white p-5 shadow-[0_18px_60px_rgba(17,17,17,0.04)]"
          >
            <div className="h-3 w-24 rounded-full bg-black/8" />
            <div className="mt-5 h-8 w-28 rounded-full bg-black/8" />
            <div className="mt-4 h-8 w-40 rounded-full bg-black/8" />
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-black/8 bg-white px-7 py-7 shadow-[0_18px_60px_rgba(17,17,17,0.04)]">
        <div className="h-3 w-28 rounded-full bg-black/8" />
        <div className="mt-5 h-8 w-72 rounded-full bg-black/8" />
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.45rem] border border-black/8 bg-[var(--surface)] p-5"
            >
              <div className="h-3 w-20 rounded-full bg-black/8" />
              <div className="mt-4 h-6 w-36 rounded-full bg-black/8" />
              <div className="mt-3 h-4 w-full rounded-full bg-black/8" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
