import "server-only";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_COMPETITOR_MODEL ?? "gpt-5-mini";

export function getOpenAIApiKey() {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  return OPENAI_API_KEY;
}

export function getOpenAICompetitorModel() {
  return OPENAI_MODEL;
}
