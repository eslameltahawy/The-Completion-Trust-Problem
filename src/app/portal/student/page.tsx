import Link from "next/link";
import { StatusPill } from "@/components/Chrome";
import type { Progress } from "@/domain/eligibility";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { getStudentDashboard } from "@/server/queries";

const notices: Record<string, string> = {
  submitted: "Your assessment was submitted and is Pending Review. A Competency Certificate has not been issued.",
};

function progressPill(progress: Progress) {
  switch (progress.kind) {
    case "verified":
      return <StatusPill tone="good">Verified</StatusPill>;
    case "revoked":
      return <StatusPill tone="bad">Revoked</StatusPill>;
    case "pending_review":
      return <StatusPill tone="pending">Pending Review</StatusPill>;
    case "returned":
      return <StatusPill tone="pending">Returned for further review</StatusPill>;
    case "in_progress":
      return <StatusPill tone="pending">In Progress</StatusPill>;
    case "not_issued":
    case "exhausted":
      return <StatusPill tone="bad">Not Verified / Not Issued</StatusPill>;
    case "design_required":
      return <StatusPill tone="neutral">Assessment Design Required</StatusPill>;
    case "not_yet_eligible":
      return <StatusPill tone="neutral">Not Yet Eligible</StatusPill>;
    default:
      return <StatusPill tone="neutral">Assessment Not Started</StatusPill>;
  }
}

function actionFor(completionId: string, progress: Progress) {
  switch (progress.kind) {
    case "ready":
      return (
        <Link className="btn btn-teal" href={`/portal/student/courses/${completionId}/assessment`}>
          Get Competency Certificate
        </Link>
      );
    case "not_issued":
      return (
        <Link className="btn btn-teal" href={`/portal/student/courses/${completionId}/assessment`}>
          Retry competency assessment
        </Link>
      );
    case "in_progress":
      return (
        <Link className="btn btn-primary" href={`/portal/student/attempts/${progress.attemptId}`}>
          Resume assessment
        </Link>
      );
    case "pending_review":
    case "returned":
    case "exhausted":
      return (
        <Link className="btn btn-ghost" href={`/portal/student/attempts/${progress.attemptId}`}>
          View assessment status
        </Link>
      );
    case "verified":
    case "revoked":
      return (
        <Link className="btn btn-teal" href={`/portal/student/certificates/${progress.certificatePublicId}`}>
          Open Competency Certificate
        </Link>
      );
    default:
      return null;
  }
}

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireRole("learner");
  const { notice } = await searchParams;
  const dashboard = await getStudentDashboard(user.id);
  const segment =
    dashboard.learner.segment === "corporate"
      ? `Corporate learner${dashboard.learner.organization ? ` · ${dashboard.learner.organization}` : ""}`
      : "Self-directed learner";

  return (
    <div className="grid gap-8">
      {notice && notices[notice] ? (
        <p className="card border-teal px-4 py-3 text-teal" role="status">
          {notices[notice]}
        </p>
      ) : null}
      <section className="card p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Student portal</p>
        <h1 className="serif mt-2 text-4xl">{dashboard.learner.name}</h1>
        <p className="mt-2 text-muted">
          {segment} · {dashboard.learner.email}
        </p>
        <p className="mt-4 max-w-3xl">
          Completing a course gives you a Course Completion Record. It does not create a Competency
          Certificate. A certificate is available only after an eligible Competency Assessment is
          reviewed and approved.
        </p>
      </section>

      <section>
        <h2 className="serif text-3xl">Completed courses</h2>
        {dashboard.courses.length === 0 ? (
          <div className="card mt-4 p-6">
            <h3 className="font-semibold">No completed courses yet</h3>
            <p className="mt-2 text-muted">
              Completion records appear here after a course is finished. This prototype does not
              include the course player, so an empty account stays empty.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {dashboard.courses.map((course) => (
              <article key={course.completionId} className="card completion-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                      Course Completion Record
                    </p>
                    <h3 className="serif mt-1 text-2xl">
                      {course.courseTitle} · {course.versionLabel}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Completed {formatDate(course.completedAt)} · {course.completionPublicId}
                    </p>
                  </div>
                  {progressPill(course.progress)}
                </div>
                <p className="mt-3 text-muted">{course.versionSummary}</p>
                {course.progress.kind === "design_required" || course.progress.kind === "not_yet_eligible" ? (
                  <p className="mt-3">{course.progress.explanation}</p>
                ) : null}
                {course.progress.kind === "exhausted" ? (
                  <p className="mt-3">
                    Not Verified / Not Issued. The attempt limit for this assessment has been reached,
                    so no Competency Certificate was issued.
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="btn btn-ghost" href={`/portal/student/completions/${course.completionId}`}>
                    View completion record
                  </Link>
                  {actionFor(course.completionId, course.progress)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="serif text-3xl">Competency certificates</h2>
        {dashboard.certificates.length === 0 ? (
          <div className="card competency-card mt-4 p-6">
            <h3 className="font-semibold">No Competency Certificates</h3>
            <p className="mt-2 text-muted">
              Course completion did not create a certificate. When an assessment is approved, the
              verified certificate will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {dashboard.certificates.map((certificate) => (
              <article key={certificate.id} className="card competency-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                  Competency Certificate
                </p>
                <h3 className="serif mt-1 text-2xl">{certificate.competency.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {certificate.courseVersion.course.title} · {certificate.courseVersion.versionLabel} ·{" "}
                  {certificate.publicId}
                </p>
                <div className="mt-3">
                  <StatusPill tone={certificate.status === "verified" ? "good" : "bad"}>
                    {certificate.status === "verified" ? "Verified" : "Revoked"}
                  </StatusPill>
                </div>
                <Link className="btn btn-teal mt-4" href={`/portal/student/certificates/${certificate.publicId}`}>
                  Open certificate
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
