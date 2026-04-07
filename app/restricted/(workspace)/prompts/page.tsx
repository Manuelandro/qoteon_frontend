import { WorkspaceSectionShell } from "../workspace-section-shell";

export const metadata = {
  title: "Prompts | Qoteon",
  description: "Prompt monitoring workspace for Qoteon.",
};

export default function PromptsPage() {
  return (
    <WorkspaceSectionShell
      description="Prompts will become the working set for the questions, tasks, and buyer-language patterns that determine whether a company surfaces in LLM responses."
      eyebrow="Prompts"
      highlights={[
        "Tracked prompts grouped by funnel stage, intent, or product category.",
        "Prompt variants for benchmarking wording changes and response quality.",
        "A place to spot prompts where the brand is missing or misrepresented.",
      ]}
      title="Organize the exact prompts that matter for AI discovery."
    />
  );
}
