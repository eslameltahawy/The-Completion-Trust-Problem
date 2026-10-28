import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getLocale } from "@/i18n/get-locale";
import { LanguageSwitch } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";
import { phrase } from "@/i18n/glossary";
import { getCurrentUser } from "@/server/auth";

export async function DemoBanner() {
  const t = copy(await getLocale());
  return (
    <p className="no-print bg-amber-soft px-4 py-2 text-center text-sm text-amber">
      {t.demoBanner}
    </p>
  );
}

export async function PortalHeader() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const t = copy(locale);
  return (
    <header className="no-print border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold">
          Career 180
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold" aria-label={t.partner}>
          <Link href="/portal/student">{t.student}</Link>
          <Link href="/portal/reviewer">{t.reviewer}</Link>
          <Link href="/portal/partner">{t.partner}</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitch locale={locale} />
          {user ? (
            <form action={logoutAction} className="flex items-center gap-3 text-sm">
              <span>
                {user.name}
                <span className="text-muted"> · {phrase(locale, user.role)}</span>
              </span>
              <button className="btn btn-ghost" type="submit">
                {t.signOut}
              </button>
            </form>
          ) : (
            <Link className="text-sm font-semibold" href="/portal/login">
              {t.signIn}
            </Link>
          )}
        </div>
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
