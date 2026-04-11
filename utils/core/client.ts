import "server-only";

import type { User } from "@supabase/supabase-js";

import { getCoreApiBaseUrl } from "@/utils/core/env";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/utils/supabase/server";

export type CoreOrganization = {
  id: string;
  name: string;
  slug: string;
  plan_type: "starter" | "growth" | "enterprise";
  created_at: string;
  updated_at: string;
};

export type CoreProject = {
  id: string;
  organization_id: string;
  name: string;
  domain: string;
  company_name: string;
  primary_category: string;
  target_region: string;
  target_language: string;
  status: "draft" | "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
};

export type CoreProjectCompetitor = {
  id: string;
  project_id: string;
  competitor_name: string;
  competitor_domain: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CorePromptRecord = {
  id: string;
  project_id: string;
  title: string;
  body?: string | null;
  cluster?: string | null;
  intent?: string | null;
  status: string;
  is_active: boolean;
  metadata_json?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type CoreSourceIntelligenceCrawlRun = {
  id: string;
  crawl_target_id: string;
  project_id: string;
  status: "queued" | "running" | "completed" | "failed" | "partial" | "cancelled";
  trigger_type: "project_setup" | "manual" | "scheduled" | "refresh";
  scope_type: "full" | "incremental" | "single_url";
  max_pages: number;
  max_depth: number;
  pages_discovered: number;
  pages_crawled: number;
  pages_stored: number;
  started_at: string | null;
  completed_at: string | null;
  metadata_json: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type CoreServiceWarning = {
  code: string;
  message: string;
  service: "core_api" | "prompt_library" | "prompt_runner" | "source_intelligence" | "dashboard_layer";
  retryable: boolean;
  details?: Record<string, unknown>;
};

export type CorePromptContext = {
  project_id: string;
  last_successful_crawl_at: string | null;
  is_ready_for_prompt_generation: boolean;
  prompt_generation_blockers: string[];
  client_website_crawl_status: "pending" | "retrying" | "passed" | "not_passed";
  client_website_crawl_message: string | null;
  client_website_crawl_attempts_made: number;
  client_website_crawl_max_attempts: number;
  crawl_coverage: {
    active_target_count: number;
    total_targets: number;
    completed_run_count: number;
    successful_target_count: number;
    total_pages: number;
    client_pages: number;
    competitor_pages: number;
    page_types: Record<string, number>;
  };
};

export type CoreProjectOverview = {
  project: {
    id: string;
    name: string;
    domain: string;
    category: string;
    language: string;
    region: string;
    status: "draft" | "active" | "paused" | "archived";
  };
  latestKpis: {
    mentionRate: number;
    avgPosition: number | null;
    shareOfVoice: number;
    promptCoverage: number;
    visibilityScore: number;
    hasData: boolean;
  } | null;
  latestRun: {
    runBatchId: string;
    runType: "baseline" | "monthly_tracking" | "experiment" | "custom";
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
  } | null;
  healthFlags: Array<{
    code: string;
    severity: "info" | "warning" | "critical";
    message: string;
    context: Record<string, unknown> | null;
  }>;
};

export type CoreProjectCreateInput = {
  organization_id: string;
  name: string;
  domain: string;
  company_name: string;
  primary_category: string;
  target_region: string;
  target_language: string;
  status?: "draft" | "active" | "paused" | "archived";
  competitors?: Array<{
    competitor_name: string;
    competitor_domain: string;
    notes?: string | null;
  }>;
  generate_initial_prompts?: boolean;
};

export type CoreSetupProjectResult = {
  status: "success" | "partial_success";
  project: CoreProject;
  competitors: CoreProjectCompetitor[];
  prompt_generation: {
    attempted: boolean;
    succeeded: boolean;
    result: unknown | null;
  };
  warnings: CoreServiceWarning[];
};

type CoreRequestOptions = {
  json?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  searchParams?: Record<string, string | number | boolean | undefined>;
};

type CoreErrorPayload = {
  code?: string;
  details?: unknown;
  error?: string;
  message?: string;
};

export class CoreApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "CoreApiError";
  }
}

export async function listCoreOrganizations(): Promise<CoreOrganization[]> {
  const payload = await coreApiRequest<{ organizations?: CoreOrganization[] }>("/organizations");
  return payload.organizations ?? [];
}

export async function createCoreOrganization(input: {
  name: string;
  slug?: string;
  plan_type?: "starter" | "growth" | "enterprise";
}): Promise<CoreOrganization> {
  return coreApiRequest<CoreOrganization>("/organizations", {
    json: input,
    method: "POST",
  });
}

export async function listCoreProjects(
  filters?: {
    organization_id?: string;
    status?: CoreProject["status"];
  },
): Promise<CoreProject[]> {
  const payload = await coreApiRequest<{ projects?: CoreProject[] }>("/projects", {
    searchParams: filters,
  });

  return payload.projects ?? [];
}

export async function createCoreProject(
  input: CoreProjectCreateInput,
): Promise<CoreSetupProjectResult> {
  return coreApiRequest<CoreSetupProjectResult>("/projects", {
    json: input,
    method: "POST",
  });
}

export async function listCoreProjectCompetitors(
  projectId: string,
): Promise<CoreProjectCompetitor[]> {
  const payload = await coreApiRequest<{ competitors?: CoreProjectCompetitor[] }>(
    `/projects/${projectId}/competitors`,
  );

  return payload.competitors ?? [];
}

export async function createCoreProjectCompetitor(
  projectId: string,
  input: {
    competitor_name: string;
    competitor_domain: string;
    notes?: string | null;
  },
): Promise<CoreProjectCompetitor> {
  return coreApiRequest<CoreProjectCompetitor>(`/projects/${projectId}/competitors`, {
    json: input,
    method: "POST",
  });
}

export async function getCoreProjectPromptContext(
  projectId: string,
): Promise<CorePromptContext> {
  return coreApiRequest<CorePromptContext>(
    `/projects/${projectId}/source-intelligence/prompt-context`,
  );
}

export async function getCoreProjectOverview(
  projectId: string,
): Promise<CoreProjectOverview> {
  return coreApiRequest<CoreProjectOverview>(`/projects/${projectId}/overview`);
}

export async function listCoreProjectCrawlRuns(
  projectId: string,
  filters?: {
    status?: string;
    limit?: number;
  },
): Promise<CoreSourceIntelligenceCrawlRun[]> {
  const payload = await coreApiRequest<{ crawl_runs?: CoreSourceIntelligenceCrawlRun[] }>(
    `/projects/${projectId}/source-intelligence/crawl-runs`,
    {
      searchParams: filters,
    },
  );

  return payload.crawl_runs ?? [];
}

export async function listCoreProjectPrompts(
  projectId: string,
  filters?: {
    status?: string;
    is_active?: boolean;
  },
): Promise<CorePromptRecord[]> {
  const payload = await coreApiRequest<{ prompts?: CorePromptRecord[] }>(
    `/projects/${projectId}/prompts`,
    {
      searchParams: {
        status: filters?.status,
        is_active: filters?.is_active,
      },
    },
  );

  return payload.prompts ?? [];
}

async function coreApiRequest<T>(
  path: string,
  options: CoreRequestOptions = {},
): Promise<T> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Core API requests require an authenticated user.");
  }

  const accessToken = await getSupabaseAccessToken();
  const url = buildCoreApiUrl(path, options.searchParams);
  const headers = buildCoreHeaders(user, accessToken, options.json !== undefined);

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
    cache: "no-store",
  });

  const payload = (await parseResponsePayload(response)) as T | CoreErrorPayload | null;

  if (!response.ok) {
    const errorPayload = payload as CoreErrorPayload | null;
    throw new CoreApiError(
      getCoreErrorMessage(errorPayload, response.status),
      response.status,
      errorPayload?.code,
      errorPayload?.details,
    );
  }

  return payload as T;
}

function buildCoreApiUrl(
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined>,
) {
  const url = new URL(path, `${getCoreApiBaseUrl()}/`);

  if (!searchParams) {
    return url.toString();
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function buildCoreHeaders(user: User, accessToken: string, hasJsonBody: boolean) {
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-user-email": user.email ?? "unknown@example.com",
    "x-user-id": user.id,
  });
  const displayName = getUserMetadataString(user, "full_name") ?? getUserMetadataString(user, "name");
  const userRole = getUserMetadataString(user, "role");

  if (displayName) {
    headers.set("x-user-name", displayName);
  }

  if (userRole) {
    headers.set("x-user-role", userRole);
  }

  if (hasJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function getSupabaseAccessToken() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to read Supabase session: ${error.message}`);
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("Missing Supabase access token for Core API request.");
  }

  return accessToken;
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
  if (payload?.message) {
    return payload.message;
  }

  if (payload?.error) {
    return payload.error;
  }

  if (status === 401) {
    return "Core API rejected the current authentication session.";
  }

  if (status === 403) {
    return "Core API denied access to this resource.";
  }

  return "Core API request failed.";
}

function getUserMetadataString(user: User, key: string) {
  const value = user.user_metadata[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
