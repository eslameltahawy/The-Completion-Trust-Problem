import Link from "next/link";
import { notFound } from "next/navigation";
import { startAssessmentAction } from "@/app/actions/assessment";
import { SubmitButton } from "@/components/SubmitButton";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { getAssessmentIntro } from "@/server/queries";

export default async function AssessmentIntroPage({
  params,
  searchParams,
}: {
  params: Promise<{ completionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("learner");
  const locale = await getLocale();
  const t = copy(locale);
  const { completionId } = await params;
  const { error } = await searchParams;
  const intro = await getAssessmentIntro(user.id, completionId);
  if (!intro) notFound();
  const canStart = intro.course.progress.kind === "ready" || intro.course.progress.kind === "not_issued";
  const resumeId =
    intro.course.progress.kind === "in_progress" ? intro.course.progress.attemptId : null;

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold" href="/portal/student">
        {locale === "ar" ? "العودة إلى اللوحة" : "Back to dashboard"}
      </Link>
      <header>
        <p className="text-sm font-semibold tracking-wide text-teal">{locale === "ar" ? "تقييم الكفاءة" : "Competency Assessment"}</p>
        <h1 className="serif mt-2 text-4xl">{phrase(locale, intro.course.courseTitle)}</h1>
        <p className="mt-2 text-muted">{intro.course.versionLabel}</p>
      </header>
      {error ? (
        <p className="card px-4 py-3 text-red" role="alert">
          {error}
        </p>
      ) : null}
      {!intro.definition || !canStart ? (
        <section className="card p-6">
          <h2 className="serif text-2xl">{t.cannotStart}</h2>
          <p className="mt-3">
            {"explanation" in intro.course.progress ? phrase(locale, intro.course.progress.explanation) : t.notEligibleAttempt}
          </p>
          {resumeId ? (
            <Link className="btn btn-primary mt-4" href={`/portal/student/attempts/${resumeId}`}>
              {t.resume}
            </Link>
          ) : null}
        </section>
      ) : (
        <form action={startAssessmentAction} className="grid gap-4">
          <input type="hidden" name="completionId" value={completionId} />
          <section className="card p-6">
            <h2 className="serif text-2xl">{phrase(locale, intro.definition.title)}</h2>
            <p className="mt-3">{phrase(locale, intro.definition.description)}</p>
            <p className="mt-3">
              {t.competency}: {phrase(locale, intro.definition.competencyName)}. {phrase(locale, intro.definition.competencyDescription)}
            </p>
            <ul className="mt-4 list-disc ps-5">
              {intro.objectives.map((objective) => (
                <li key={objective}>{phrase(locale, objective)}</li>
              ))}
            </ul>
          </section>
          <section className="card grid gap-3 p-6">
            <h2 className="font-semibold">{locale === "ar" ? "القواعد والمحاولات والوقت والخصوصية" : "Rules, attempts, time, and privacy"}</h2>
            <p>{phrase(locale, intro.definition.policySummary)}</p>
            <p>
              {t.method}: {phrase(locale, intro.definition.method)}.
            </p>
            <p>
              {t.timeLimit}: {intro.definition.durationMinutes} {t.minutes}. {t.attemptLimit}: {intro.definition.maxAttempts}. {t.attemptHypothesis}
            </p>
            <p>
              {intro.definition.passingScoreHypothesis
                ? `${intro.definition.passingScoreHypothesis}% ${t.scoreHypothesis}`
                : t.rubricNote}
            </p>
            <p>{t.humanReview}</p>
            <p>{t.noCamera}</p>
            <div>
              <h3 className="font-semibold">{t.criteriaHeading}</h3>
              <ul className="mt-2 list-disc ps-5">
                {intro.definition.criteria.map((criterion) => (
                  <li key={criterion.name}>
                    {phrase(locale, criterion.name)}: {phrase(locale, criterion.description)}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <label className="flex gap-3">
            <input type="checkbox" name="integrityConsent" value="yes" />
            <span>{t.consent}</span>
          </label>
          <label className="flex gap-3">
            <input type="checkbox" name="acknowledged" value="yes" required />
            <span>{t.acknowledge}</span>
          </label>
          <SubmitButton tone="teal" pendingLabel={t.starting}>
            {t.startAssessment}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
