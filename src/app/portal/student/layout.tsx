import { requireRole } from "@/server/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("learner");
  return children;
}
