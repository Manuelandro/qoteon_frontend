import Link from "next/link";

type MarketingHeaderProps = {
  currentPath?: "/" | "/pricing";
};

function getLinkClass(isActive: boolean) {
  if (isActive) {
    return "rounded-full bg-black px-4 py-2 text-sm text-white";
  }

  return "rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black";
}

export function MarketingHeader({ currentPath = "/" }: MarketingHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-5">
      <Link className="text-sm font-semibold uppercase tracking-[0.24em]" href="/">
        Qoteon
      </Link>
      <div className="flex flex-wrap gap-3">
        <Link className={getLinkClass(currentPath === "/")} href="/">
          Home
        </Link>
        <Link className={getLinkClass(currentPath === "/pricing")} href="/pricing">
          Pricing
        </Link>
        <Link
          className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-black/90"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
