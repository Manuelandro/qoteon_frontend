import "server-only";

import { cookies } from "next/headers";

import { normalizeWebsiteUrl } from "@/utils/company";

const COMPANY_DRAFT_COOKIE = "algome_onboarding_company";

export type CompanyDraft = {
  description: string;
  name: string;
  website_url: string;
};

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeDraft(value: unknown): CompanyDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const name = getStringValue((value as { name?: unknown }).name);
  const websiteUrl = normalizeWebsiteUrl(
    getStringValue((value as { website_url?: unknown }).website_url),
  );
  const description = getStringValue((value as { description?: unknown }).description);

  if (!name || !websiteUrl || !description) {
    return null;
  }

  return {
    name,
    website_url: websiteUrl,
    description,
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
