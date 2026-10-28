import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/server/auth";

export function DemoBanner() {
  return (
    <p className="no-print bg-amber-soft px-4 py-2 text-center text-sm text-amber">
      Demo authentication. These accounts are local sample data and are not connected to Career 180
      production systems.
    </p>
  );
}

export async function PortalHeader() {
  const user = await getCurrentUser();
  return (
    <header className="no-print border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold">
          Career 180
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold" aria-label="Portals">
          <Link href="/portal/student">Student</Link>
          <Link href="/portal/reviewer">Reviewer</Link>
          <Link href="/portal/partner">Employer partner</Link>
        </nav>
        {user ? (
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <span>
              {user.name}
              <span className="text-muted"> · {user.role}</span>
            </span>
            <button className="btn btn-ghost" type="submit">
              Sign out
            </button>
          </form>
        ) : (
          <Link className="text-sm font-semibold" href="/portal/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "neutral" | "pending" | "good" | "bad";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-slate-soft text-slate",
    pending: "bg-amber-soft text-amber",
    good: "bg-teal-soft text-teal",
    bad: "bg-red-soft text-red",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
