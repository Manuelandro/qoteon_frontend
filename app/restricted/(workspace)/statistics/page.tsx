import { WorkspaceSectionShell } from "../workspace-section-shell";

export const metadata = {
  title: "Statistics | Qoteon",
  description: "Statistics workspace for Qoteon visibility reporting.",
};

export default function StatisticsPage() {
  return (
    <WorkspaceSectionShell
      description="This area is reserved for the metrics layer: how often Qoteon clients appear in chatbot answers, which prompts trigger them, and how that visibility evolves over time."
      eyebrow="Statistics"
      highlights={[
        "Daily visibility trends across tracked models and prompt groups.",
        "Share-of-answer benchmarks versus direct competitors.",
        "Top gains, drops, and notable prompt movements to investigate.",
      ]}
      title="Track the movement of your AI visibility over time."
    />
  );
}
