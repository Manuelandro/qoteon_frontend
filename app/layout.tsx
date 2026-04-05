import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algome | Brand Visibility Inside AI Answers",
  description:
    "Algome helps companies earn visibility inside ChatGPT, Gemini, Claude, and other LLM responses through software and managed execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
