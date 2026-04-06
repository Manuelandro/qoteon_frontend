import { requireAuthenticatedUser } from "@/utils/supabase/server";

export default async function RestrictedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedUser("/restricted");

  return <div className="flex-1">{children}</div>;
}
