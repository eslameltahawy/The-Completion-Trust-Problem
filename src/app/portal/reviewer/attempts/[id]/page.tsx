import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm, RevokeForm } from "@/components/ReviewForms";
import { StatusPill } from "@/components/Chrome";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDateTime } from "@/server/format";
import { getReviewAttempt, parseCriteria, parseElements, parseOptions, stateLabel } from "@/server/queries";

export default async function ReviewAttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireRole("reviewer");
  const locale = await getLocale();
  const t = copy(locale);
  const { id } = await params;
  const { notice } = await searchParams;
  const data = await getReviewAttempt(id);
  if (!data) notFound();
  const { attempt, history } = data;
  const course = attempt.assessmentVersion.definition.courseVersion.course.title;
  const criteria = attempt.evaluation ? parseCriteria(attempt.evaluation.criterionResultsJson) : [];
  const canDecide = attempt.state === "pending_review" || attempt.state === "returned";

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold" href="/portal/reviewer">
        {t.backQueue}
      </Link>
      {notice ? (
        <p className="card px-4 py-3" role="status">
          {t.decisionSaved}
        </p>
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted">{t.assessmentEvidence}</p>
          <h1 className="serif text-4xl">{attempt.learner.name}</h1>
          <p className="mt-2 text-muted">
            {phrase(locale, course)} · {attempt.assessmentVersion.definition.courseVersion.versionLabel} ·{" "}
            {phrase(locale, attempt.assessmentVersion.definition.competency.name)}
          </p>
          <p className="text-sm text-muted">
            {attempt.learner.email}
            {attempt.learner.segment === "corporate" ? ` · ${t.corporate}` : ` · ${t.selfDirected}`}
            {attempt.learner.organization ? ` · ${attempt.learner.organization}` : ""}
          </p>
          <p className="mt-2 max-w-2xl text-sm">{t.enrollmentNote}</p>
        </div>
        <StatusPill tone={attempt.state === "issued" ? "good" : attempt.state === "not_issued" ? "bad" : "pending"}>
          {phrase(locale, stateLabel(attempt.state))}
        </StatusPill>
      </header>

      <section className="card p-5">
        <h2 className="font-semibold">{t.attemptHistory}</h2>
        <ul className="mt-3 grid gap-2">
          {history.map((item) => (
            <li key={item.id}>
              <Link href={`/portal/reviewer/attempts/${item.id}`}>
                {t.attemptWord} {item.attemptNumber}: {phrase(locale, stateLabel(item.state))}
                {item.evaluation ? ` · ${t.proposedWord} ${phrase(locale, item.evaluation.proposedOutcome)}` : ""}
                {item.certificate ? ` · ${item.certificate.publicId}` : ""}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Course Completion record {attempt.completionRecord.publicId} · {attempt.completionRecord.courseVersion.versionLabel}.{" "}
          {t.startedLabel} {formatDateTime(attempt.startedAt, locale)}.
          {attempt.submittedAt ? ` ${t.submittedLabel} ${formatDateTime(attempt.submittedAt, locale)}.` : ""}
        </p>
        {attempt.accommodationNote ? <p className="mt-2">{phrase(locale, attempt.accommodationNote)}</p> : null}
      </section>

      {attempt.evaluation ? (
        <section className="card p-5">
          <h2 className="font-semibold">{t.demoEval}</h2>
          <p className="mt-2">
            {t.method} {phrase(locale, attempt.evaluation.method)}. {t.proposedWord}{" "}
            {phrase(locale, attempt.evaluation.proposedOutcome)}
            {attempt.evaluation.scorePercent !== null ? ` · ${attempt.evaluation.scorePercent}%` : ""}.
          </p>
          <p className="mt-2">{phrase(locale, attempt.evaluation.rationale)}</p>
          <p className="mt-2 text-muted">{phrase(locale, attempt.evaluation.hypothesisLabel)}</p>
          <ul className="mt-3 list-disc ps-5">
            {criteria.map((criterion) => (
              <li key={criterion.criterionId}>
                {phrase(locale, criterion.name)}: {phrase(locale, criterion.level.replaceAll("_", " "))}.{" "}
                {phrase(locale, criterion.notes)}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="card p-5">{t.noProposed}</p>
      )}

      <section className="grid gap-4">
        <h2 className="serif text-2xl">{t.questionsHeading}</h2>
        {attempt.assessmentVersion.questions.map((question, index) => {
          const answer = attempt.answers.find((item) => item.questionId === question.id);
          return (
            <article key={question.id} className="card p-5">
              <h3 className="font-semibold">
                {index + 1}. {phrase(locale, question.prompt)}
              </h3>
              {question.context ? <p className="mt-2 whitespace-pre-wrap text-muted">{phrase(locale, question.context)}</p> : null}
              <p className="mt-3">
                <span className="font-semibold">{t.answerLabel}: </span>
                {answer?.value ? phrase(locale, answer.value) : t.noAnswer}
              </p>
              {question.correctOptionKey ? (
                <p className="mt-2 text-sm text-muted">
                  {t.keyedOption}: {question.correctOptionKey}
                </p>
              ) : null}
              {parseElements(question.expectedElementsJson).length > 0 ? (
                <p className="mt-2 text-sm text-muted">
                  {t.hiddenKeys}: {parseElements(question.expectedElementsJson).join(", ")}
                </p>
              ) : null}
              {question.criterion ? (
                <p className="mt-2 text-sm">
                  {t.criterionWord}: {phrase(locale, question.criterion.name)}. {phrase(locale, question.criterion.description)}
                </p>
              ) : null}
              {question.optionsJson ? (
                <ul className="mt-2 list-disc ps-5 text-sm">
                  {parseOptions(question.optionsJson).map((option) => (
                    <li key={option.key}>
                      {option.key}. {phrase(locale, option.text)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">{t.integrity}</h2>
        <p className="mt-2 text-sm text-muted">{t.reviewerIntegrity}</p>
        {attempt.integrityEvents.length === 0 ? (
          <p className="mt-3">{t.noSignals}</p>
        ) : (
          <ul className="mt-3 list-disc ps-5">
            {attempt.integrityEvents.map((event) => (
              <li key={event.id}>
                {formatDateTime(event.occurredAt, locale)} · {phrase(locale, event.eventType)} · {phrase(locale, event.source)}.{" "}
                {phrase(locale, event.note)}
              </li>
            ))}
          </ul>
        )}
        {attempt.evidence ? <p className="mt-3">{phrase(locale, attempt.evidence.summary)}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">{t.decisions}</h2>
        {attempt.decisions.length === 0 ? <p className="mt-2">{t.noDecision}</p> : null}
        <ul className="mt-3 grid gap-3">
          {attempt.decisions.map((decision) => (
            <li key={decision.id}>
              <p className="font-semibold">
                {phrase(locale, decision.decision)} · {decision.reviewer.name} · {formatDateTime(decision.createdAt, locale)}
                {decision.materialChange ? ` · ${t.materialChange}` : ""}
              </p>
              <p>{decision.reason}</p>
            </li>
          ))}
        </ul>
      </section>

      {canDecide ? (
        <section className="card p-5">
          <h2 className="serif text-2xl">{t.reviewDecision}</h2>
          <div className="mt-4">
            <ReviewForm attemptId={attempt.id} allowReturn={attempt.state === "pending_review"} />
          </div>
        </section>
      ) : null}

      {attempt.certificate?.status === "verified" ? (
        <section className="card p-5">
          <h2 className="font-semibold">
            {t.revokeTitle} {attempt.certificate.publicId}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.revokeHelp}</p>
          <div className="mt-4">
            <RevokeForm attemptId={attempt.id} publicId={attempt.certificate.publicId} />
          </div>
        </section>
      ) : null}
      {attempt.certificate?.status === "revoked" ? (
        <p className="card p-5">
          {attempt.certificate.publicId} {t.revokedNotice} {attempt.certificate.revocationReason}
        </p>
      ) : null}
    </div>
  );
}
