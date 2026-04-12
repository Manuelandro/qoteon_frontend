import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LANGUAGES,
  sanitizeRegions,
  sanitizeLanguages,
} from "@/utils/company-profile-options";
import { normalizeWebsiteUrl } from "@/utils/company";

const COMPANY_DRAFT_COOKIE = "qoteon_onboarding_company";

export type CompanyDraft = {
  category: string;
  region: string[];
  languages: string[];
  name: string;
  website_url: string;
};

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getStringValues(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeDraft(value: unknown): CompanyDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const name = getStringValue((value as { name?: unknown }).name);
  const websiteUrl = normalizeWebsiteUrl(
    getStringValue((value as { website_url?: unknown }).website_url),
  );
  const category =
    getStringValue((value as { category?: unknown }).category) ||
    getStringValue((value as { description?: unknown }).description);
  const region = sanitizeRegions([
    ...getStringValues((value as { region?: unknown }).region),
    getStringValue((value as { country?: unknown }).country),
  ]);
  const languages = sanitizeLanguages(
    Array.isArray((value as { languages?: unknown }).languages)
      ? (value as { languages: unknown[] }).languages
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
      : [...DEFAULT_LANGUAGES],
  );

  if (!name || !websiteUrl || !category) {
    return null;
  }

  return {
    category,
    region,
    languages,
    name,
    website_url: websiteUrl,
  };
}

export async function getCompanyDraft() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COMPANY_DRAFT_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  try {
    return normalizeDraft(JSON.parse(cookieValue));
  } catch {
    return null;
  }
}

export async function setCompanyDraft(draft: CompanyDraft) {
  const cookieStore = await cookies();

  cookieStore.set(COMPANY_DRAFT_COOKIE, JSON.stringify(draft), {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearCompanyDraft() {
  const cookieStore = await cookies();
  cookieStore.delete(COMPANY_DRAFT_COOKIE);
}
