import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/utils/navigation";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/utils/supabase/env";

type PendingCookie = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
    priority?: "low" | "medium" | "high";
    partitioned?: boolean;
  };
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  let pendingCookies: PendingCookie[] = [];
  let pendingHeaders: Record<string, string> = {};

  const applyAuthState = (nextResponse: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) => {
      nextResponse.cookies.set(name, value, options);
    });

    Object.entries(pendingHeaders).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  };

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        pendingCookies = cookiesToSet;
        pendingHeaders = headers;

        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        applyAuthState(response);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isRestrictedRoute = pathname.startsWith("/restricted");
  const isLoginRoute = pathname === "/login";

  if (isRestrictedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    const redirectTo = `${pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set("redirectTo", redirectTo);
    return applyAuthState(NextResponse.redirect(loginUrl));
  }

  if (isLoginRoute && user) {
    const destination = getSafeRedirectPath(request.nextUrl.searchParams.get("redirectTo"));

    return applyAuthState(NextResponse.redirect(new URL(destination, request.url)));
  }

  return applyAuthState(response);
}
