import Link from "next/link";
import { notFound } from "next/navigation";
import { startAssessmentAction } from "@/app/actions/assessment";
import { SubmitButton } from "@/components/SubmitButton";
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
        Back to dashboard
      </Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-teal">Competency Assessment</p>
        <h1 className="serif mt-2 text-4xl">{intro.course.courseTitle}</h1>
        <p className="mt-2 text-muted">{intro.course.versionLabel}</p>
      </header>
      {error ? (
        <p className="card px-4 py-3 text-red" role="alert">
          {error}
        </p>
      ) : null}
      {!intro.definition || !canStart ? (
        <section className="card p-6">
          <h2 className="serif text-2xl">A proof 180 Certificate cannot be started from here</h2>
          <p className="mt-3">
            {"explanation" in intro.course.progress
              ? intro.course.progress.explanation
              : "This completion is not eligible for a new attempt."}
          </p>
          {resumeId ? (
            <Link className="btn btn-primary mt-4" href={`/portal/student/attempts/${resumeId}`}>
              Resume assessment
            </Link>
          ) : null}
        </section>
      ) : (
        <form action={startAssessmentAction} className="grid gap-4">
          <input type="hidden" name="completionId" value={completionId} />
          <section className="card p-6">
            <h2 className="serif text-2xl">{intro.definition.title}</h2>
            <p className="mt-3">{intro.definition.description}</p>
            <p className="mt-3">
              Competency: {intro.definition.competencyName}. {intro.definition.competencyDescription}
            </p>
            <ul className="mt-4 list-disc pl-5">
              {intro.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>
          <section className="card grid gap-3 p-6">
            <h2 className="font-semibold">Rules, attempts, time, and privacy</h2>
            <p>{intro.definition.policySummary}</p>
            <p>Method: {intro.definition.method}.</p>
            <p>
              Time limit: {intro.definition.durationMinutes} minutes. Attempt limit: {intro.definition.maxAttempts}.
              The attempt limit is a product hypothesis and has not been validated with live cohorts.
            </p>
            <p>
              {intro.definition.passingScoreHypothesis
                ? `A score of ${intro.definition.passingScoreHypothesis}% is an unvalidated passing hypothesis. It does not issue a proof 180 Certificate.`
                : "This assessment uses rubric levels. It does not treat an answer-similarity percentage as proof of competency."}
            </p>
            <p>
              Human review is required. Submission moves the attempt to Pending Review. A proof 180
              Certificate is issued only after a reviewer approves it.
            </p>
            <p>
              The prototype does not use your camera and does not capture your screen. If you consent,
              the browser can record when this tab is hidden. Those signals are review indicators, not
              proof of cheating, and employer partners never see them.
            </p>
            <div>
              <h3 className="font-semibold">Criteria</h3>
              <ul className="mt-2 list-disc pl-5">
                {intro.definition.criteria.map((criterion) => (
                  <li key={criterion.name}>
                    {criterion.name}: {criterion.description}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <label className="flex gap-3">
            <input type="checkbox" name="integrityConsent" value="yes" />
            <span>I consent to tab-visibility signals for this attempt. The camera and screen stay off.</span>
          </label>
          <label className="flex gap-3">
            <input type="checkbox" name="acknowledged" value="yes" required />
            <span>I have read the rules and understand that a Course Completion record alone will not issue a proof 180 Certificate.</span>
          </label>
          <SubmitButton tone="teal" pendingLabel="Starting...">
            Start assessment
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
