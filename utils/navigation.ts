const DEFAULT_REDIRECT_PATH = "/restricted";

export function getSafeRedirectPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH,
) {
  const redirectTo = Array.isArray(value) ? value[0] : value;

  if (typeof redirectTo !== "string") {
    return fallback;
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  return redirectTo;
}
