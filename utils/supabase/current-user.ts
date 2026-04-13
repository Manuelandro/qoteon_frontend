import "server-only";

import { cache } from "react";

import { getAuthenticatedUser } from "@/utils/supabase/server";

export type CurrentAppUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export const getCurrentAppUser = cache(async (): Promise<CurrentAppUser | null> => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: getMetadataString(metadata, "full_name") ?? getMetadataString(metadata, "name"),
  };
});
