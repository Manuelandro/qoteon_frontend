import { getAuthenticatedUser } from "@/utils/supabase/server";
import { getOpenAIApiKey, getOpenAICompetitorModel } from "@/utils/openai";
import { getOnboardingState } from "@/utils/supabase/company";
import { normalizeDomain } from "@/utils/company";

type SuggestionRequest = {
  companyDescription: string;
  companyDomain: string;
  companyName: string;
};

type OpenAICompetitor = {
  competitor_domain: string;
  competitor_favicon: string;
  competitor_name: string;
};

function getPrompt({
  companyDescription,
  companyDomain,
  companyName,
}: SuggestionRequest) {
  return `${companyName} at ${companyDomain} is a company focus on ${companyDescription}. Please find me the most 5 relevant competitors of its niche and return them in array of object such as [{ competitor_name, competitor_favicon, competitor_domain}, ...].`;
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("output_text" in payload && typeof payload.output_text === "string") {
    return payload.output_text;
  }

  if (!("output" in payload)) {
    return null;
  }

  const output = (payload as { output?: unknown[] }).output;

  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object" || !("type" in item)) {
      continue;
    }

    if ((item as { type?: string }).type !== "message") {
      continue;
    }

    const content = (item as { content?: unknown[] }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const entry of content) {
      if (
        entry &&
        typeof entry === "object" &&
        (entry as { type?: string }).type === "output_text" &&
        typeof (entry as { text?: unknown }).text === "string"
      ) {
        return (entry as { text: string }).text;
      }
    }
  }

  return null;
}

function buildFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function normalizeCompetitors(
  payload: unknown,
  companyDomain: string,
): OpenAICompetitor[] {
  if (!payload || typeof payload !== "object" || !("competitors" in payload)) {
    return [];
  }

  const competitors = (payload as { competitors?: unknown[] }).competitors;

  if (!Array.isArray(competitors)) {
    return [];
  }

  const seen = new Set<string>();

  return competitors
    .map((competitor) => {
      if (!competitor || typeof competitor !== "object") {
        return null;
      }

      const name =
        typeof (competitor as { competitor_name?: unknown }).competitor_name === "string"
          ? (competitor as { competitor_name: string }).competitor_name.trim()
          : "";
      const inputDomain =
        typeof (competitor as { competitor_domain?: unknown }).competitor_domain === "string"
          ? (competitor as { competitor_domain: string }).competitor_domain.trim()
          : "";
      const domain = normalizeDomain(inputDomain);

      if (!name || !domain || domain === companyDomain || seen.has(domain)) {
        return null;
      }

      seen.add(domain);

      return {
        competitor_name: name,
        competitor_domain: domain,
        competitor_favicon: buildFaviconUrl(domain),
      };
    })
    .filter((competitor): competitor is OpenAICompetitor => Boolean(competitor))
    .slice(0, 5);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const onboardingState = await getOnboardingState();

  if (
    !onboardingState.requiresFirstAccessSetup ||
    onboardingState.isOnboardingComplete
  ) {
    return Response.json(
      { error: "Competitor suggestions are only available during first-access onboarding." },
      { status: 403 },
    );
  }

  let body: Partial<SuggestionRequest>;

  try {
    body = (await request.json()) as Partial<SuggestionRequest>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companyName = body.companyName?.trim();
  const companyDomain = normalizeDomain(body.companyDomain ?? "");
  const companyDescription = body.companyDescription?.trim();

  if (!companyName || !companyDomain || !companyDescription) {
    return Response.json(
      { error: "companyName, companyDomain, and companyDescription are required." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getOpenAIApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getOpenAICompetitorModel(),
        reasoning: {
          effort: "minimal",
        },
        input: getPrompt({
          companyDescription,
          companyDomain,
          companyName,
        }),
        text: {
          format: {
            type: "json_schema",
            name: "competitor_suggestions",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                competitors: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      competitor_name: {
                        type: "string",
                      },
                      competitor_favicon: {
                        type: "string",
                      },
                      competitor_domain: {
                        type: "string",
                      },
                    },
                    required: [
                      "competitor_name",
                      "competitor_favicon",
                      "competitor_domain",
                    ],
                  },
                },
              },
              required: ["competitors"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();

      return Response.json(
        { error: `OpenAI request failed: ${errorPayload}` },
        { status: 502 },
      );
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return Response.json(
        { error: "OpenAI returned no structured competitor suggestions." },
        { status: 502 },
      );
    }

    const suggestions = normalizeCompetitors(JSON.parse(outputText), companyDomain);

    return Response.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return Response.json({ error: message }, { status: 500 });
  }
}
