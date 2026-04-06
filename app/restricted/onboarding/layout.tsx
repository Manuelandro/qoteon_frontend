import { RestrictedHeader } from "../restricted-header";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <RestrictedHeader />
        {children}
      </div>
    </div>
  );
}
