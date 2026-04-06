function parseUrlLikeValue(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const candidate = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./, "");

    if (!hostname || !hostname.includes(".")) {
      return null;
    }

    return {
      hostname,
      url,
    };
  } catch {
    return null;
  }
}

export function normalizeWebsiteUrl(value: string) {
  const parsed = parseUrlLikeValue(value);

  if (!parsed) {
    return null;
  }

  return `${parsed.url.protocol}//${parsed.hostname}`;
}

export function normalizeDomain(value: string) {
  const parsed = parseUrlLikeValue(value);

  if (!parsed) {
    return null;
  }

  return parsed.hostname;
}
