"use client";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid gap-5">
      <section className="rounded-[2rem] border border-rose-900/10 bg-rose-900/[0.05] px-7 py-8 text-rose-950 shadow-[0_16px_50px_rgba(17,17,17,0.03)] sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-rose-950/60">
          Workspace error
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em]">
          The analyst workspace could not finish rendering.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-rose-950/82">
          {error.message || "An unexpected error interrupted the dashboard render."}
        </p>
        <button
          className="mt-6 rounded-full border border-rose-950/14 bg-white/80 px-4 py-2 text-sm text-rose-950 transition hover:bg-white"
          onClick={() => reset()}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
