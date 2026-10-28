import Link from "next/link";
import { notFound } from "next/navigation";
import { AttemptRunner } from "@/components/AttemptRunner";
import { StatusPill } from "@/components/Chrome";
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
  const { id } = await params;
  const query = await searchParams;
  await submitIfExpired({ actorId: user.id, attemptId: id });
  const attempt = await getLearnerAttempt(user.id, id);
  if (!attempt) notFound();
  const editable = attempt.state === "in_progress";

  return (
    <div className="grid gap-6">
      <Link className="text-sm font-semibold" href="/portal/student">
        Back to dashboard
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal">Competency Assessment</p>
          <h1 className="serif mt-2 text-4xl">{attempt.courseTitle}</h1>
          <p className="mt-2 text-muted">
            {attempt.competencyName} · {attempt.versionLabel} · Attempt {attempt.attemptNumber}
          </p>
        </div>
        <StatusPill tone={attempt.state === "issued" ? "good" : attempt.state === "not_issued" ? "bad" : "pending"}>
          {attempt.stateLabel}
        </StatusPill>
      </header>
      {query.notice === "submitted" ? (
        <p className="card px-4 py-3" role="status">
          Submitted. The result is Pending Review. A proof 180 Certificate has not been issued.
        </p>
      ) : null}
      {query.error ? (
        <p className="card px-4 py-3 text-red" role="alert">
          {query.error}
        </p>
      ) : null}
      {attempt.accommodationNote ? <p className="card p-4">{attempt.accommodationNote}</p> : null}
      {attempt.evaluation ? (
        <section className="card p-5">
          <h2 className="font-semibold">Proposed result</h2>
          <p className="mt-2">
            {attempt.evaluation.proposedOutcome === "pass" ? "Proposed pass" : "Proposed fail"}
            {attempt.evaluation.scorePercent !== null ? ` · ${attempt.evaluation.scorePercent}%` : ""}
            . Method: {attempt.evaluation.method}.
          </p>
          <p className="mt-2 text-muted">{attempt.evaluation.hypothesisLabel}</p>
          <ul className="mt-3 list-disc pl-5">
            {attempt.evaluation.criteria.map((criterion) => (
              <li key={criterion.criterionId}>
                {criterion.name}: {criterion.level.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {attempt.decisions.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-semibold">Review</h2>
          <ul className="mt-3 grid gap-3">
            {attempt.decisions.map((decision) => (
              <li key={decision.id}>
                <p className="font-semibold">
                  {decision.decision} · {decision.reviewerName} · {formatDateTime(decision.createdAt)}
                </p>
                <p>{decision.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {attempt.certificate ? (
        <Link className="btn btn-teal w-fit" href={`/portal/student/certificates/${attempt.certificate.publicId}`}>
          Open proof 180 Certificate {attempt.certificate.publicId}
        </Link>
      ) : null}
      {attempt.integrityEvents.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-semibold">Integrity signals</h2>
          <p className="mt-2 text-sm text-muted">
            These are review indicators, not proof of misconduct. The camera and screen were not captured.
          </p>
          <ul className="mt-3 list-disc pl-5">
            {attempt.integrityEvents.map((event) => (
              <li key={event.id}>
                {event.eventType} · {event.source} · {event.note}
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
