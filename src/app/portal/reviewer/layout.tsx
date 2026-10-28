import { requireRole } from "@/server/auth";

export default async function ReviewerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("reviewer");
  return children;
}
