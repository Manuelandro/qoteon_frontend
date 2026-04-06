import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { createSupabaseServerClient, getAuthenticatedUser } from "@/utils/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  first_access: boolean;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
};

function getMetadataString(user: User, key: string) {
  const value = user.user_metadata[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function buildProfilePayload(user: User) {
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: getMetadataString(user, "full_name") ?? getMetadataString(user, "name"),
    company_name: getMetadataString(user, "company_name"),
  };
}

export const getCurrentUserProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(buildProfilePayload(user), {
      onConflict: "id",
    })
    .select("id, email, first_access, full_name, company_name, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data as Profile;
});
