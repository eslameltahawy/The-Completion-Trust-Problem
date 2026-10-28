import Link from "next/link";
import { DemoBanner } from "@/components/Chrome";
import { getLocale } from "@/i18n/get-locale";
import { LanguageSwitch } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";

export default async function HomePage() {
  const locale = await getLocale();
  const t = copy(locale);
  const samples = [
    { id: "CTC-4F8C1A9B2E", label: "proof 180 Certificate" },
    { id: "CTC-77B3E2D1C8", label: locale === "ar" ? "proof 180 Certificate مُلغاة" : "Revoked proof 180 Certificate" },
    { id: "CCR-LAYLA-EXCL1", label: "Course Completion record" },
    { id: "CTC-DOES-NOT-EXIST", label: t.unknownId },
  ];

  return (
    <>
      <DemoBanner />
      <header className="no-print border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <p className="text-sm font-semibold tracking-wide">Career 180 · Completion Trust</p>
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex flex-wrap gap-4 text-sm font-semibold" aria-label={t.partner}>
              <Link href="/portal/student">{t.student}</Link>
              <Link href="/portal/reviewer">{t.reviewer}</Link>
              <Link href="/portal/partner">{t.partner}</Link>
            </nav>
            <LanguageSwitch locale={locale} />
            <Link className="text-sm font-semibold" href="/portal/login">
              {t.signIn}
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-semibold tracking-wide text-teal">Career 180</p>
        <h1 className="serif mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">{t.homeTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">{t.homeLead}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="card completion-card p-6">
            <p className="text-xs font-semibold tracking-wide text-slate">Course Completion record</p>
            <h2 className="serif mt-2 text-2xl">{t.finishedCourse}</h2>
            <p className="mt-2 text-muted">{t.homeCompletionBody}</p>
          </article>
          <article className="card competency-card p-6">
            <p className="text-xs font-semibold tracking-wide text-teal">proof 180 Certificate</p>
            <h2 className="serif mt-2 text-2xl">{t.demonstrated}</h2>
            <p className="mt-2 text-muted">{t.homeCertificateBody}</p>
          </article>
        </div>

        <section className="card mt-8 p-6">
          <h2 className="serif text-2xl">{t.verificationTitle}</h2>
          <p className="mt-2 max-w-3xl text-muted">{t.homeVerify}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((sample) => (
              <Link key={sample.id} className="btn btn-ghost text-sm" href={`/portal/partner?id=${sample.id}`}>
                {sample.label}
              </Link>
            ))}
          </div>
          <Link className="btn btn-teal mt-4" href="/portal/partner">
            {t.openPartner}
          </Link>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link className="card p-5" href="/portal/login">
            <h2 className="font-semibold">{t.studentPortal}</h2>
            <p className="mt-2 text-sm text-muted">{t.studentCard}</p>
          </Link>
          <Link className="card p-5" href="/portal/login">
            <h2 className="font-semibold">{t.reviewerQueue}</h2>
            <p className="mt-2 text-sm text-muted">{t.reviewerCard}</p>
          </Link>
          <Link className="card p-5" href="/portal/partner">
            <h2 className="font-semibold">{t.partner}</h2>
            <p className="mt-2 text-sm text-muted">{t.partnerCard}</p>
          </Link>
        </section>
      </main>
    </>
  );
}
