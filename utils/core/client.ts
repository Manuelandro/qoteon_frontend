import "server-only";

import type { User } from "@supabase/supabase-js";

import { getCoreApiBaseUrl } from "@/utils/core/env";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/utils/supabase/server";

export type CoreOrganization = {
  id: string;
  name: string;
  slug: string;
  plan_type: "trial" | "starter" | "growth" | "enterprise";
  billing_status: "trialing" | "active" | "expired" | "cancelled";
  project_limit: number;
  competitor_limit: number;
  tracked_model_limit: number;
  tracked_prompts_daily_limit: number;
  llm_response_limit: number;
  article_draft_limit: number;
  page_improvement_limit: number;
  crawled_page_limit: number;
  data_retention_months: number | null;
  trial_started_at: string | null;
  trial_expires_at: string | null;
  billing_period_started_at: string | null;
  billing_period_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
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
  target_region: string[];
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

export type CoreCompetitorPrefillResult = {
  source: "existing" | "generated";
  competitors: CoreProjectCompetitor[];
  warnings: CoreServiceWarning[];
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
  suggested_personas: string[];
  suggested_use_cases: string[];
  suggested_features: string[];
  suggested_integrations: string[];
  suggested_industries: string[];
  suggested_comparison_topics: string[];
  suggested_faq_questions: string[];
  competitor_signal_groups: Array<{
    project_competitor_id: string;
    competitor_name: string | null;
    competitor_domain: string | null;
    personas: string[];
    use_cases: string[];
    features: string[];
    integrations: string[];
    industries: string[];
    comparison_topics: string[];
    faq_questions: string[];
  }>;
};

export type CoreDashboardRunType =
  | "baseline"
  | "daily_tracking"
  | "experiment"
  | "custom";

export type CoreDashboardTrendDirection =
  | "up"
  | "down"
  | "flat"
  | "unavailable";

export type CoreDashboardHealthFlagSeverity = "info" | "warning" | "critical";

export type CoreDashboardComparisonValue = {
  current: number | null;
  previous: number | null;
  delta: number | null;
  percentDelta: number | null;
  direction: CoreDashboardTrendDirection;
};

export type CoreDashboardSummaryComparison = {
  comparedRunBatchId: string;
  overallDirection: CoreDashboardTrendDirection;
  mentionRate: CoreDashboardComparisonValue;
  avgPosition: CoreDashboardComparisonValue;
  shareOfVoice: CoreDashboardComparisonValue;
  promptCoverage: CoreDashboardComparisonValue;
  competitorPressure: CoreDashboardComparisonValue;
  visibilityScore: CoreDashboardComparisonValue;
};

export type CoreDashboardMetricTrend = {
  comparedRunBatchId: string | null;
  overallDirection: CoreDashboardTrendDirection;
  mentionRateDelta: number | null;
  avgPositionDelta: number | null;
  shareOfVoiceDelta: number | null;
  competitorPressureDelta: number | null;
  visibilityScoreDelta: number | null;
};

export type CoreDashboardRunBatchProgress = {
  runBatchId: string;
  runType: CoreDashboardRunType;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  totalExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
};

export type CoreVisibilitySummary = {
  projectId: string;
  runBatchId: string | null;
  mentionRate: number;
  avgPosition: number | null;
  shareOfVoice: number;
  promptCoverage: number;
  modelCoverage: {
    coverageRate: number;
    totalModels: number;
    modelsWithBrandMention: number;
  };
  competitorPressure: number;
  visibilityScore: number;
  comparedToPrevious: CoreDashboardSummaryComparison | null;
  hasData: boolean;
};

export type CoreDashboardModelComparisonRow = {
  aiModelId: string;
  modelName: string;
  totalExecutions: number;
  mentionRate: number;
  avgPosition: number | null;
  shareOfVoice: number;
  competitorPressure: number;
  visibilityScore: number;
  trend: CoreDashboardMetricTrend | null;
};

export type CoreDashboardClusterComparisonRow = {
  clusterName: string;
  totalExecutions: number;
  mentionRate: number;
  avgPosition: number | null;
  shareOfVoice: number;
  competitorPressure: number;
  visibilityScore: number;
  statusLabel: "strong" | "moderate" | "weak";
  trend: CoreDashboardMetricTrend | null;
};

export type CoreDashboardCompetitorComparisonRow = {
  competitorName: string;
  competitorEntityId: string | null;
  totalMentions: number;
  mentionRate: number;
  shareOfVoice: number;
  promptOverlapCount: number;
  winsAgainstClientCount: number;
  clientVsCompetitorDelta: number;
  dominantClusters: string[];
};

export type CoreDashboardTimeSeriesPoint = {
  runBatchId: string | null;
  runType: CoreDashboardRunType | null;
  observedAt: string;
  value: number | null;
};

export type CoreDashboardHealthFlag = {
  code: string;
  severity: CoreDashboardHealthFlagSeverity;
  message: string;
  context: Record<string, unknown> | null;
};

export type CoreProjectOverview = {
  project: {
    id: string;
    name: string;
    domain: string;
    category: string;
    language: string;
    region: string[];
    status: "draft" | "active" | "paused" | "archived";
  };
  latestKpis: CoreVisibilitySummary | null;
  latestRun: CoreDashboardRunBatchProgress | null;
  keyInsights: {
    strongestModel: CoreDashboardModelComparisonRow | null;
    weakestModel: CoreDashboardModelComparisonRow | null;
    weakestCluster: CoreDashboardClusterComparisonRow | null;
    topCompetitor: CoreDashboardCompetitorComparisonRow | null;
    visibilityTrendDirection: CoreDashboardTrendDirection;
  };
  healthFlags: CoreDashboardHealthFlag[];
  previews: {
    models: CoreDashboardModelComparisonRow[];
    clusters: CoreDashboardClusterComparisonRow[];
    competitors: CoreDashboardCompetitorComparisonRow[];
    recentRuns: CoreDashboardRunBatchProgress[];
  };
};

export type CoreDashboardComparisonMetadata = {
  runBatchId: string | null;
  comparedRunBatchId: string | null;
  runType: CoreDashboardRunType | null;
  observedAt: string | null;
  totalItems: number;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

export type CoreVisibilityModelsResponse = {
  projectId: string;
  runBatchId: string | null;
  items: CoreDashboardModelComparisonRow[];
  summary: CoreDashboardComparisonMetadata;
};

export type CoreVisibilityClustersResponse = {
  projectId: string;
  runBatchId: string | null;
  items: CoreDashboardClusterComparisonRow[];
  summary: CoreDashboardComparisonMetadata;
};

export type CoreVisibilityCompetitorsResponse = {
  projectId: string;
  runBatchId: string | null;
  items: CoreDashboardCompetitorComparisonRow[];
  summary: CoreDashboardComparisonMetadata & {
    topCompetitor: CoreDashboardCompetitorComparisonRow | null;
    dominantClusters: Array<{
      clusterName: string;
      competitorName: string;
    }>;
  };
};

export type CoreVisibilityTrendsResponse = {
  projectId: string;
  metrics: {
    mentionRate: CoreDashboardTimeSeriesPoint[];
    avgPosition: CoreDashboardTimeSeriesPoint[];
    visibilityScore: CoreDashboardTimeSeriesPoint[];
    shareOfVoice: CoreDashboardTimeSeriesPoint[];
  };
  comparisons: {
    latestVsPreviousRun: CoreDashboardSummaryComparison | null;
    latestDailyVsPreviousDaily: CoreDashboardSummaryComparison | null;
    baselineVsLatest: CoreDashboardSummaryComparison | null;
  };
};

export type CoreRunBatch = {
  id: string;
  project_id: string;
  run_type: CoreDashboardRunType;
  status: string;
  prompt_ids: string[];
  ai_model_ids: string[];
  execution_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  metadata_json: Record<string, unknown> | null;
};

export type CoreRunBatchProgress = {
  run_batch_id: string;
  status: string;
  total_executions: number;
  queued_executions: number;
  running_executions: number;
  completed_executions: number;
  failed_executions: number;
  progress_percent: number;
  updated_at?: string;
};

export type CoreRunResultsSummary = {
  run: CoreDashboardRunBatchProgress & {
    projectId: string;
  };
  kpiSummary: CoreVisibilitySummary;
  modelSummary: CoreDashboardModelComparisonRow[];
  clusterSummary: CoreDashboardClusterComparisonRow[];
  competitorSummary: CoreDashboardCompetitorComparisonRow[];
};

export type CoreProjectCreateInput = {
  organization_id: string;
  name: string;
  domain: string;
  company_name: string;
  primary_category: string;
  target_region: string[];
  target_language: string;
  status?: "draft" | "active" | "paused" | "archived";
  competitors?: Array<{
    competitor_name: string;
    competitor_domain: string;
    notes?: string | null;
  }>;
  generate_initial_prompts?: boolean;
};

export type CoreProjectUpdateInput = Partial<{
  name: string;
  domain: string;
  company_name: string;
  primary_category: string;
  target_region: string[];
  target_language: string;
  status: "draft" | "active" | "paused" | "archived";
}>;

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
  error?:
    | string
    | {
        code?: string;
        message?: string;
        details?: unknown;
      };
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
  plan_type?: "trial" | "starter" | "growth" | "enterprise";
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

export async function updateCoreProject(
  projectId: string,
  input: CoreProjectUpdateInput,
): Promise<CoreProject> {
  return coreApiRequest<CoreProject>(`/projects/${projectId}`, {
    json: input,
    method: "PATCH",
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

export async function deleteCoreProjectCompetitor(
  projectId: string,
  competitorId: string,
): Promise<void> {
  await coreApiRequest<void>(`/projects/${projectId}/competitors/${competitorId}`, {
    method: "DELETE",
  });
}

export async function prefillCoreProjectCompetitors(
  projectId: string,
): Promise<CoreCompetitorPrefillResult> {
  return coreApiRequest<CoreCompetitorPrefillResult>(
    `/projects/${projectId}/competitors/prefill`,
    {
      method: "POST",
    },
  );
}

export async function bootstrapCoreProjectCompetitors(
  projectId: string,
): Promise<{ warnings: CoreServiceWarning[] }> {
  return coreApiRequest<{ warnings: CoreServiceWarning[] }>(
    `/projects/${projectId}/competitors/bootstrap`,
    {
      method: "POST",
    },
  );
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

export async function getCoreProjectVisibilitySummary(
  projectId: string,
  filters?: {
    runBatchId?: string;
    runType?: CoreDashboardRunType;
    startDate?: string;
    endDate?: string;
  },
): Promise<CoreVisibilitySummary> {
  return coreApiRequest<CoreVisibilitySummary>(
    `/projects/${projectId}/visibility/summary`,
    {
      searchParams: filters,
    },
  );
}

export async function getCoreProjectVisibilityModels(
  projectId: string,
  filters?: {
    runBatchId?: string;
    runType?: CoreDashboardRunType;
    modelId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortBy?:
      | "modelName"
      | "totalExecutions"
      | "mentionRate"
      | "avgPosition"
      | "shareOfVoice"
      | "competitorPressure"
      | "visibilityScore";
    sortDirection?: "asc" | "desc";
  },
): Promise<CoreVisibilityModelsResponse> {
  return coreApiRequest<CoreVisibilityModelsResponse>(
    `/projects/${projectId}/visibility/models`,
    {
      searchParams: filters,
    },
  );
}

export async function getCoreProjectVisibilityClusters(
  projectId: string,
  filters?: {
    runBatchId?: string;
    runType?: CoreDashboardRunType;
    clusterName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortBy?:
      | "clusterName"
      | "totalExecutions"
      | "mentionRate"
      | "avgPosition"
      | "shareOfVoice"
      | "competitorPressure"
      | "visibilityScore";
    sortDirection?: "asc" | "desc";
  },
): Promise<CoreVisibilityClustersResponse> {
  return coreApiRequest<CoreVisibilityClustersResponse>(
    `/projects/${projectId}/visibility/clusters`,
    {
      searchParams: filters,
    },
  );
}

export async function getCoreProjectVisibilityCompetitors(
  projectId: string,
  filters?: {
    runBatchId?: string;
    runType?: CoreDashboardRunType;
    clusterName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortBy?:
      | "competitorName"
      | "totalMentions"
      | "mentionRate"
      | "shareOfVoice"
      | "winsAgainstClientCount"
      | "clientVsCompetitorDelta";
    sortDirection?: "asc" | "desc";
  },
): Promise<CoreVisibilityCompetitorsResponse> {
  return coreApiRequest<CoreVisibilityCompetitorsResponse>(
    `/projects/${projectId}/visibility/competitors`,
    {
      searchParams: filters,
    },
  );
}

export async function getCoreProjectVisibilityTrends(
  projectId: string,
  filters?: {
    runType?: CoreDashboardRunType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  },
): Promise<CoreVisibilityTrendsResponse> {
  return coreApiRequest<CoreVisibilityTrendsResponse>(
    `/projects/${projectId}/visibility/trends`,
    {
      searchParams: filters,
    },
  );
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

export async function listCoreProjectRunBatches(
  projectId: string,
  filters?: {
    status?: string;
    run_type?: CoreDashboardRunType;
    start_date?: string;
    end_date?: string;
    limit?: number;
  },
): Promise<CoreRunBatch[]> {
  const payload = await coreApiRequest<{ run_batches?: CoreRunBatch[] }>(
    `/projects/${projectId}/run-batches`,
    {
      searchParams: filters,
    },
  );

  return payload.run_batches ?? [];
}

export async function getCoreRunBatchProgress(
  runBatchId: string,
): Promise<CoreRunBatchProgress> {
  return coreApiRequest<CoreRunBatchProgress>(
    `/run-batches/${runBatchId}/progress`,
  );
}

export async function getCoreRunBatchResults(
  runBatchId: string,
): Promise<CoreRunResultsSummary> {
  return coreApiRequest<CoreRunResultsSummary>(
    `/run-batches/${runBatchId}/results`,
  );
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
      getCoreErrorCode(errorPayload),
      getCoreErrorDetails(errorPayload),
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
    return "Core API rejected the current authentication session.";
  }

  if (status === 403) {
    return "Core API denied access to this resource.";
  }

  return "Core API request failed.";
}

function getCoreErrorCode(payload: CoreErrorPayload | null) {
  const nestedError =
    payload?.error && typeof payload.error === "object" ? payload.error : null;

  return nestedError?.code ?? payload?.code;
}

function getCoreErrorDetails(payload: CoreErrorPayload | null) {
  const nestedError =
    payload?.error && typeof payload.error === "object" ? payload.error : null;

  return nestedError?.details ?? payload?.details;
}

function getUserMetadataString(user: User, key: string) {
  const value = user.user_metadata[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
