"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CoreApiError,
  deleteCoreProjectPrompt,
  importCoreProjectPromptLibraryItem,
  updateCoreProjectPrompt,
} from "@/utils/core/client";

function buildPageHref(input: {
  search?: string;
  edit?: string;
  deleteId?: string;
  message?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("q", input.search);
  }

  if (input.edit) {
    params.set("edit", input.edit);
  }

  if (input.deleteId) {
    params.set("delete", input.deleteId);
  }

  if (input.message) {
    params.set("message", input.message);
  }

  if (input.error) {
    params.set("error", input.error);
  }

  const query = params.toString();
  return query ? `/restricted/prompts?${query}` : "/restricted/prompts";
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof CoreApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The prompt action could not be completed.";
}

export async function updatePromptAction(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const promptId = String(formData.get("prompt_id") ?? "");
  const promptText = String(formData.get("prompt_text") ?? "");
  const search = String(formData.get("search") ?? "");

  try {
    await updateCoreProjectPrompt(projectId, promptId, {
      prompt_text: promptText,
    });
  } catch (error) {
    redirect(
      buildPageHref({
        search,
        edit: promptId,
        error: getActionErrorMessage(error),
      }),
    );
  }

  revalidatePath("/restricted/prompts");
  redirect(
    buildPageHref({
      search,
      message: "Prompt updated.",
    }),
  );
}

export async function deletePromptAction(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const promptId = String(formData.get("prompt_id") ?? "");
  const search = String(formData.get("search") ?? "");

  try {
    await deleteCoreProjectPrompt(projectId, promptId);
  } catch (error) {
    redirect(
      buildPageHref({
        search,
        deleteId: promptId,
        error: getActionErrorMessage(error),
      }),
    );
  }

  revalidatePath("/restricted/prompts");
  redirect(
    buildPageHref({
      search,
      message: "Prompt deleted.",
    }),
  );
}

export async function importPromptLibraryItemAction(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const promptId = String(formData.get("prompt_id") ?? "");
  const search = String(formData.get("search") ?? "");

  try {
    await importCoreProjectPromptLibraryItem(projectId, promptId);
  } catch (error) {
    redirect(
      buildPageHref({
        search,
        error: getActionErrorMessage(error),
      }),
    );
  }

  revalidatePath("/restricted/prompts");
  redirect(
    buildPageHref({
      search,
      message: "Prompt added to Prompt Analysis.",
    }),
  );
}
