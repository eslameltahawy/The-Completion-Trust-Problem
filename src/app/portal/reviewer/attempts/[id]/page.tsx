import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm, RevokeForm } from "@/components/ReviewForms";
import { StatusPill } from "@/components/Chrome";
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
        Back to queue
      </Link>
      {notice ? (
        <p className="card px-4 py-3" role="status">
          The decision was saved. Certificate state follows the review outcome.
        </p>
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Assessment evidence</p>
          <h1 className="serif text-4xl">{attempt.learner.name}</h1>
          <p className="mt-2 text-muted">
            {course} · {attempt.assessmentVersion.definition.courseVersion.versionLabel} ·{" "}
            {attempt.assessmentVersion.definition.competency.name}
          </p>
          <p className="text-sm text-muted">
            {attempt.learner.email}
            {attempt.learner.segment === "corporate" ? " · Corporate learner" : " · Self-directed learner"}
            {attempt.learner.organization ? ` · ${attempt.learner.organization}` : ""}
          </p>
          <p className="mt-2 max-w-2xl text-sm">
            Enrollment type is context only. Corporate and self-directed learners are judged on the same rubric. It is not a competency score.
          </p>
        </div>
        <StatusPill tone={attempt.state === "issued" ? "good" : attempt.state === "not_issued" ? "bad" : "pending"}>
          {stateLabel(attempt.state)}
        </StatusPill>
      </header>

      <section className="card p-5">
        <h2 className="font-semibold">Attempt history</h2>
        <ul className="mt-3 grid gap-2">
          {history.map((item) => (
            <li key={item.id}>
              <Link href={`/portal/reviewer/attempts/${item.id}`}>
                Attempt {item.attemptNumber}: {stateLabel(item.state)}
                {item.evaluation ? ` · proposed ${item.evaluation.proposedOutcome}` : ""}
                {item.certificate ? ` · ${item.certificate.publicId}` : ""}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Completion record {attempt.completionRecord.publicId} on{" "}
          {attempt.completionRecord.courseVersion.versionLabel}. Started {formatDateTime(attempt.startedAt)}.
          {attempt.submittedAt ? ` Submitted ${formatDateTime(attempt.submittedAt)}.` : ""}
        </p>
        {attempt.accommodationNote ? <p className="mt-2">{attempt.accommodationNote}</p> : null}
      </section>

      {attempt.evaluation ? (
        <section className="card p-5">
          <h2 className="font-semibold">Demo evaluation</h2>
          <p className="mt-2">
            Method {attempt.evaluation.method}. Proposed {attempt.evaluation.proposedOutcome}
            {attempt.evaluation.scorePercent !== null ? ` · ${attempt.evaluation.scorePercent}%` : ""}.
          </p>
          <p className="mt-2">{attempt.evaluation.rationale}</p>
          <p className="mt-2 text-muted">{attempt.evaluation.hypothesisLabel}</p>
          <ul className="mt-3 list-disc pl-5">
            {criteria.map((criterion) => (
              <li key={criterion.criterionId}>
                {criterion.name}: {criterion.level.replaceAll("_", " ")}. {criterion.notes}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="card p-5">This attempt has not been submitted, so there is no proposed result.</p>
      )}

      <section className="grid gap-4">
        <h2 className="serif text-2xl">Questions, answers, and rubric</h2>
        {attempt.assessmentVersion.questions.map((question, index) => {
          const answer = attempt.answers.find((item) => item.questionId === question.id);
          return (
            <article key={question.id} className="card p-5">
              <h3 className="font-semibold">
                {index + 1}. {question.prompt}
              </h3>
              {question.context ? <p className="mt-2 whitespace-pre-wrap text-muted">{question.context}</p> : null}
              <p className="mt-3">
                <span className="font-semibold">Answer: </span>
                {answer?.value || "No answer saved."}
              </p>
              {question.correctOptionKey ? (
                <p className="mt-2 text-sm text-muted">Keyed option: {question.correctOptionKey}</p>
              ) : null}
              {parseElements(question.expectedElementsJson).length > 0 ? (
                <p className="mt-2 text-sm text-muted">
                  Demo evaluator keys, hidden from the learner: {parseElements(question.expectedElementsJson).join(", ")}
                </p>
              ) : null}
              {question.criterion ? (
                <p className="mt-2 text-sm">
                  Criterion: {question.criterion.name}. {question.criterion.description}
                </p>
              ) : null}
              {question.optionsJson ? (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {parseOptions(question.optionsJson).map((option) => (
                    <li key={option.key}>
                      {option.key}. {option.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Integrity signals</h2>
        <p className="mt-2 text-sm text-muted">
          Signals are review indicators, not conclusive proof. Do not reject a learner for one signal
          alone. Nothing here came from a camera or a screen capture.
        </p>
        {attempt.integrityEvents.length === 0 ? (
          <p className="mt-3">No integrity signals were recorded.</p>
        ) : (
          <ul className="mt-3 list-disc pl-5">
            {attempt.integrityEvents.map((event) => (
              <li key={event.id}>
                {formatDateTime(event.occurredAt)} · {event.eventType} · {event.source}. {event.note}
              </li>
            ))}
          </ul>
        )}
        {attempt.evidence ? <p className="mt-3">{attempt.evidence.summary}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Decisions</h2>
        {attempt.decisions.length === 0 ? <p className="mt-2">No decision has been recorded.</p> : null}
        <ul className="mt-3 grid gap-3">
          {attempt.decisions.map((decision) => (
            <li key={decision.id}>
              <p className="font-semibold">
                {decision.decision} · {decision.reviewer.name} · {formatDateTime(decision.createdAt)}
                {decision.materialChange ? " · material change" : ""}
              </p>
              <p>{decision.reason}</p>
            </li>
          ))}
        </ul>
      </section>

      {canDecide ? (
        <section className="card p-5">
          <h2 className="serif text-2xl">Review decision</h2>
          <div className="mt-4">
            <ReviewForm attemptId={attempt.id} allowReturn={attempt.state === "pending_review"} />
          </div>
        </section>
      ) : null}

      {attempt.certificate?.status === "verified" ? (
        <section className="card p-5">
          <h2 className="font-semibold">Revoke {attempt.certificate.publicId}</h2>
          <p className="mt-2 text-sm text-muted">
            Revocation keeps the original issue record and marks the certificate Revoked for employer
            checks. The reason is not shown to employer partners.
          </p>
          <div className="mt-4">
            <RevokeForm attemptId={attempt.id} publicId={attempt.certificate.publicId} />
          </div>
        </section>
      ) : null}
      {attempt.certificate?.status === "revoked" ? (
        <p className="card p-5">
          {attempt.certificate.publicId} is Revoked. {attempt.certificate.revocationReason}
        </p>
      ) : null}
    </div>
  );
}
