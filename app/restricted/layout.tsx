import { getCoreApiBaseUrl } from "@/utils/core/env";
import { requireAuthenticatedUser } from "@/utils/supabase/server";

import { RestrictedOnboardingProgressModal } from "./restricted-onboarding-progress-modal";

export default async function RestrictedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedUser("/restricted");
  const coreApiBaseUrl = getCoreApiBaseUrl();

  return (
    <div className="flex-1">
      {children}
      <RestrictedOnboardingProgressModal coreApiBaseUrl={coreApiBaseUrl} />
    </div>
  );
}
