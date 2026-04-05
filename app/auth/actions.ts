"use server";

import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/utils/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export type AuthFormState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

function getEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

function getPassword(formData: FormData) {
  return String(formData.get("password") ?? "");
}

function getFullName(formData: FormData) {
  return String(formData.get("fullName") ?? "").trim();
}

function getCompanyName(formData: FormData) {
  return String(formData.get("companyName") ?? "").trim();
}

function getRedirectTarget(formData: FormData) {
  return getSafeRedirectPath(formData.get("redirectTo"));
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getEmail(formData);
  const password = getPassword(formData);

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const redirectTo = getRedirectTarget(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(redirectTo);
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getEmail(formData);
  const password = getPassword(formData);
  const fullName = getFullName(formData);
  const companyName = getCompanyName(formData);

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  if (!fullName || !companyName) {
    return {
      error: "Full name and company name are required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
    };
  }

  const redirectTo = getRedirectTarget(formData);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        app: "algome",
        full_name: fullName,
        company_name: companyName,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (data.session) {
    redirect(redirectTo);
  }

  return {
    success:
      "Account created. If email confirmation is enabled in Supabase, confirm the email before signing in.",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect("/login");
}
