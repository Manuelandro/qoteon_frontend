import { getCoreApiBaseUrl } from "@/utils/core/browser-env";
import type { ProjectOnboardingProgressResponse } from "@/utils/core/project-onboarding";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

type CoreErrorPayload = {
  error?:
    | string
    | {
        message?: string;
      };
  message?: string;
};

export class CoreBrowserApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CoreBrowserApiError";
    this.status = status;
  }
}

export function shouldSuppressCoreOnboardingProgressError(error: unknown) {
  return (
    error instanceof CoreBrowserApiError &&
    (error.status === 404 || error.status >= 500)
  );
}

export async function getCoreProjectOnboardingProgressBrowser(
  projectId: string,
  coreApiBaseUrl?: string,
): Promise<ProjectOnboardingProgressResponse> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to read the Supabase session in the browser: ${error.message}`);
  }

  const accessToken = data.session?.access_token;
  const user = data.session?.user;

  if (!accessToken || !user) {
    throw new Error("An active Supabase session is required before Core can be polled.");
  }

  const url = new URL(
    `/projects/${projectId}/onboarding-progress`,
    `${getCoreApiBaseUrl(coreApiBaseUrl)}/`,
  );
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildCoreHeaders(user, accessToken),
    cache: "no-store",
  });
  const payload = (await parseResponsePayload(response)) as
    | ProjectOnboardingProgressResponse
    | CoreErrorPayload
    | null;

  if (!response.ok) {
    throw new CoreBrowserApiError(
      getCoreErrorMessage(payload as CoreErrorPayload | null, response.status),
      response.status,
    );
  }

  return payload as ProjectOnboardingProgressResponse;
}

function buildCoreHeaders(
  user: {
    id: string;
    email?: string | null;
    user_metadata: Record<string, unknown>;
  },
  accessToken: string,
) {
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-user-email": user.email ?? "unknown@example.com",
    "x-user-id": user.id,
  });
  const displayName = getUserMetadataString(user.user_metadata, "full_name") ??
    getUserMetadataString(user.user_metadata, "name");
  const userRole = getUserMetadataString(user.user_metadata, "role");

  if (displayName) {
    headers.set("x-user-name", displayName);
  }

  if (userRole) {
    headers.set("x-user-role", userRole);
  }

  return headers;
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      message: text,
    };
  }
}

function getCoreErrorMessage(payload: CoreErrorPayload | null, status: number) {
  const nestedError =
    payload?.error && typeof payload.error === "object" ? payload.error : null;

  if (nestedError?.message) {
    return nestedError.message;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (typeof payload?.error === "string") {
    return payload.error;
  }

  if (status === 401) {
    return "Core rejected the current browser session while onboarding progress was being refreshed.";
  }

  if (status === 403) {
    return "Core denied access to this project while onboarding progress was being refreshed.";
  }

  return "Unable to refresh onboarding progress from Core.";
}

function getUserMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];

  return typeof value === "string" ? value : null;
}
