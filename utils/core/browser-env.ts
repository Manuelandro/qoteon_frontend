export function getCoreApiBaseUrl(explicitBaseUrl?: string) {
  const configuredBaseUrl =
    explicitBaseUrl ?? process.env.NEXT_PUBLIC_QOTEON_CORE_API_URL;

  if (!configuredBaseUrl) {
    throw new Error(
      "Missing Core API browser base URL. Set NEXT_PUBLIC_QOTEON_CORE_API_URL for browser-side polling.",
    );
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}
