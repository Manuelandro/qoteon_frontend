import { WorkspaceSectionShell } from "../workspace-section-shell";

export const metadata = {
  title: "Articles | Qoteon",
  description: "Article planning workspace for Qoteon.",
};

export default function ArticlesPage() {
  return (
    <WorkspaceSectionShell
      description="Articles will map the content assets that support stronger citations, better grounding, and more consistent brand inclusion across AI-generated answers."
      eyebrow="Articles"
      highlights={[
        "Editorial ideas tied directly to high-value prompt clusters.",
        "Coverage gaps where no source material supports the desired response.",
        "A clear backlog for creating and improving citation-ready content.",
      ]}
      title="Build the content backlog that feeds stronger AI mentions."
    />
  );
}
