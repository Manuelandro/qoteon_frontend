import "server-only";

const CORE_API_BASE_URL =
  process.env.QOTEON_CORE_API_URL ?? process.env.NEXT_PUBLIC_QOTEON_CORE_API_URL;

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required Core API environment variable: ${name}`);
  }

  return value;
}

export function getCoreApiBaseUrl() {
  return requireEnv(
    CORE_API_BASE_URL,
    "QOTEON_CORE_API_URL or NEXT_PUBLIC_QOTEON_CORE_API_URL",
  ).replace(/\/+$/, "");
}
