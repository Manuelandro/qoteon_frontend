import { redirect } from "next/navigation";

import { RestrictedHeader } from "../restricted-header";
import { getOnboardingState } from "@/utils/core/workspace";
import { WorkspaceNavigation } from "./workspace-navigation";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const state = await getOnboardingState();

  if (!state.isOnboardingComplete) {
    redirect(state.nextStep);
  }

  const workspaceLabel =
    state.project?.company_name.trim() ||
    state.companyContext?.name.trim() ||
    "Company";

  return (
    <div className="min-h-screen lg:pl-24">
      <WorkspaceNavigation workspaceLabel={workspaceLabel} />
      <div className="px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8">
          <RestrictedHeader />
          {children}
        </div>
      </div>
    </div>
  );
}
