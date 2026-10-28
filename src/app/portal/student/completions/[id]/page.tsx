import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ShareActions";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { getCompletionForLearner } from "@/server/queries";

export default async function CompletionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("learner");
  const locale = await getLocale();
  const t = copy(locale);
  const { id } = await params;
  const completion = await getCompletionForLearner(user.id, id);
  if (!completion) notFound();

  return (
    <article className="sheet sheet-completion">
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <Link className="btn btn-ghost" href="/portal/student">
          {locale === "ar" ? "العودة إلى اللوحة" : "Back to dashboard"}
        </Link>
        <PrintButton />
      </div>
      <p className="text-xs font-semibold tracking-wide text-slate">Course Completion record</p>
      <h1 className="serif mt-2 text-4xl">{phrase(locale, completion.courseVersion.course.title)}</h1>
      <p className="mt-3 max-w-2xl text-lg">{t.recordExplainer}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">{t.learner}</dt>
          <dd className="font-semibold">{completion.learner.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.recordId}</dt>
          <dd className="font-semibold">{completion.publicId}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.courseVersion}</dt>
          <dd className="font-semibold">{completion.courseVersion.versionLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.completed}</dt>
          <dd className="font-semibold">{formatDate(completion.completedAt, locale)}</dd>
        </div>
      </dl>
      <p className="mt-6">{phrase(locale, completion.courseVersion.summary)}</p>
      {completion.legacyLabel ? (
        <p className="mt-4">
          {t.historicalNote} {locale === "ar" ? "التسمية الأصلية:" : "Original label:"} {phrase(locale, completion.legacyLabel)}.
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted">
        {locale === "ar"
          ? "لا يستطيع شريك التوظيف استخدام معرّف هذا السجل لإثبات الكفاءة."
          : "Employer partners cannot use this record ID to verify competency."}
      </p>
    </article>
  );
}
