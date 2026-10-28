import Link from "next/link";
import { notFound } from "next/navigation";
import { AttemptRunner } from "@/components/AttemptRunner";
import { StatusPill } from "@/components/Chrome";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDateTime } from "@/server/format";
import { getLearnerAttempt } from "@/server/queries";
import { submitIfExpired } from "@/server/services";

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireRole("learner");
  const locale = await getLocale();
  const t = copy(locale);
  const { id } = await params;
  const query = await searchParams;
  await submitIfExpired({ actorId: user.id, attemptId: id });
  const attempt = await getLearnerAttempt(user.id, id);
  if (!attempt) notFound();
  const editable = attempt.state === "in_progress";

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold" href="/portal/student">
        {t.backDashboard}
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-teal">{t.competencyAssessment}</p>
          <h1 className="serif mt-2 text-4xl">{phrase(locale, attempt.courseTitle)}</h1>
          <p className="mt-2 text-muted">
            {phrase(locale, attempt.competencyName)} · {attempt.versionLabel} · {t.attemptWord} {attempt.attemptNumber}
          </p>
        </div>
        <StatusPill tone={attempt.state === "issued" ? "good" : attempt.state === "not_issued" ? "bad" : "pending"}>
          {phrase(locale, attempt.stateLabel)}
        </StatusPill>
      </header>
      {query.notice === "submitted" ? (
        <p className="card px-4 py-3" role="status">
          {t.pendingAttempt}
        </p>
      ) : null}
      {query.error ? (
        <p className="card px-4 py-3 text-red" role="alert">
          {query.error}
        </p>
      ) : null}
      {attempt.accommodationNote ? <p className="card p-4">{phrase(locale, attempt.accommodationNote)}</p> : null}
      {attempt.evaluation ? (
        <section className="card p-5">
          <h2 className="font-semibold">{t.proposedResult}</h2>
          <p className="mt-2">
            {attempt.evaluation.proposedOutcome === "pass" ? t.proposedPass : t.proposedFail}
            {attempt.evaluation.scorePercent !== null ? ` · ${attempt.evaluation.scorePercent}%` : ""}. {t.method}:{" "}
            {phrase(locale, attempt.evaluation.method)}.
          </p>
          <p className="mt-2 text-muted">{phrase(locale, attempt.evaluation.hypothesisLabel)}</p>
          <ul className="mt-3 list-disc ps-5">
            {attempt.evaluation.criteria.map((criterion) => (
              <li key={criterion.criterionId}>
                {phrase(locale, criterion.name)}: {phrase(locale, criterion.level.replaceAll("_", " "))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {attempt.decisions.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-semibold">{t.reviewHeading}</h2>
          <ul className="mt-3 grid gap-3">
            {attempt.decisions.map((decision) => (
              <li key={decision.id}>
                <p className="font-semibold">
                  {phrase(locale, decision.decision)} · {decision.reviewerName} · {formatDateTime(decision.createdAt, locale)}
                </p>
                <p>{decision.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {attempt.certificate ? (
        <Link className="btn btn-teal w-fit" href={`/portal/student/certificates/${attempt.certificate.publicId}`}>
          {t.openCertificate} {attempt.certificate.publicId}
        </Link>
      ) : null}
      {attempt.integrityEvents.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-semibold">{t.integrity}</h2>
          <p className="mt-2 text-sm text-muted">{t.learnerIntegrity}</p>
          <ul className="mt-3 list-disc ps-5">
            {attempt.integrityEvents.map((event) => (
              <li key={event.id}>
                {phrase(locale, event.eventType)} · {phrase(locale, event.source)} · {phrase(locale, event.note)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <AttemptRunner
        attemptId={attempt.id}
        deadlineAt={attempt.deadlineAt}
        integrityConsent={attempt.integrityConsent}
        editable={editable}
        questions={attempt.questions}
      />
    </div>
  );
}
