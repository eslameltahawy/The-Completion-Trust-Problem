import Link from "next/link";
import { StatusPill } from "@/components/Chrome";
import type { Progress } from "@/domain/eligibility";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { getStudentDashboard } from "@/server/queries";

function progressPill(progress: Progress, locale: "en" | "ar") {
  const label = (english: string) => phrase(locale, english);
  switch (progress.kind) {
    case "verified":
      return <StatusPill tone="good">{label("Verified")}</StatusPill>;
    case "revoked":
      return <StatusPill tone="bad">{label("Revoked")}</StatusPill>;
    case "pending_review":
      return <StatusPill tone="pending">{label("Pending Review")}</StatusPill>;
    case "returned":
      return <StatusPill tone="pending">{label("Returned for further review")}</StatusPill>;
    case "in_progress":
      return <StatusPill tone="pending">{label("In Progress")}</StatusPill>;
    case "not_issued":
    case "exhausted":
      return <StatusPill tone="bad">{label("Not Verified / Not Issued")}</StatusPill>;
    case "design_required":
      return <StatusPill tone="neutral">{label("Assessment Design Required")}</StatusPill>;
    case "not_yet_eligible":
      return <StatusPill tone="neutral">{label("Not Yet Eligible")}</StatusPill>;
    default:
      return <StatusPill tone="neutral">{label("Assessment Not Started")}</StatusPill>;
  }
}

function actionFor(completionId: string, progress: Progress, t: ReturnType<typeof copy>) {
  switch (progress.kind) {
    case "ready":
      return (
        <Link className="btn btn-teal" href={`/portal/student/courses/${completionId}/assessment`}>
          {t.getCertificate}
        </Link>
      );
    case "not_issued":
      return (
        <Link className="btn btn-teal" href={`/portal/student/courses/${completionId}/assessment`}>
          {t.retry}
        </Link>
      );
    case "in_progress":
      return (
        <Link className="btn btn-primary" href={`/portal/student/attempts/${progress.attemptId}`}>
          {t.resume}
        </Link>
      );
    case "pending_review":
    case "returned":
    case "exhausted":
      return (
        <Link className="btn btn-ghost" href={`/portal/student/attempts/${progress.attemptId}`}>
          {t.viewStatus}
        </Link>
      );
    case "verified":
    case "revoked":
      return (
        <Link className="btn btn-teal" href={`/portal/student/certificates/${progress.certificatePublicId}`}>
          {t.openCertificate}
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
  const locale = await getLocale();
  const t = copy(locale);
  const { notice } = await searchParams;
  const dashboard = await getStudentDashboard(user.id);
  const segment =
    dashboard.learner.segment === "corporate"
      ? `${t.corporate}${dashboard.learner.organization ? ` · ${dashboard.learner.organization}` : ""}`
      : t.selfDirected;

  return (
    <div className="grid gap-8">
      {notice === "submitted" ? (
        <p className="card border-teal px-4 py-3 text-teal" role="status">
          {t.submittedNotice}
        </p>
      ) : null}
      <section className="card p-6">
        <p className="text-sm font-semibold tracking-wide text-muted">{t.studentPortal}</p>
        <h1 className="serif mt-2 text-4xl">{dashboard.learner.name}</h1>
        <p className="mt-2 text-muted">
          {segment} · {dashboard.learner.email}
        </p>
        <p className="mt-4 max-w-3xl">{t.completionIntro}</p>
      </section>

      <section>
        <h2 className="serif text-3xl">{t.completedCourses}</h2>
        {dashboard.courses.length === 0 ? (
          <div className="card mt-4 p-6">
            <h3 className="font-semibold">{t.emptyCoursesTitle}</h3>
            <p className="mt-2 text-muted">{t.emptyCourses}</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {dashboard.courses.map((course) => (
              <article key={course.completionId} className="card completion-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate">
                      Course Completion record
                    </p>
                    <h3 className="serif mt-1 text-2xl">
                      {phrase(locale, course.courseTitle)} · {course.versionLabel}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {t.completed} {formatDate(course.completedAt, locale)} · {course.completionPublicId}
                    </p>
                  </div>
                  {progressPill(course.progress, locale)}
                </div>
                <p className="mt-3 text-muted">{phrase(locale, course.versionSummary)}</p>
                {course.progress.kind === "design_required" || course.progress.kind === "not_yet_eligible" ? (
                  <p className="mt-3">
                    {course.progress.kind === "design_required"
                      ? locale === "ar"
                        ? "تصميم التقييم مطلوب. لهذه الدورة Course Completion record فقط. لا يوجد تقييم كفاءة معتمد بعد، لذلك لا يمكن إصدار proof 180 Certificate."
                        : course.progress.explanation
                      : locale === "ar"
                        ? "غير مؤهل بعد. هذا الإتمام لنسخة لا تتضمن هذا التقييم. إنهاء النسخة الأقدم لا يؤهل المتعلّم لتقييم النسخة الأحدث، والسجل التاريخي يبقى كما هو."
                        : course.progress.explanation}
                  </p>
                ) : null}
                {course.progress.kind === "exhausted" ? <p className="mt-3">{t.exhausted}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="btn btn-ghost" href={`/portal/student/completions/${course.completionId}`}>
                    {t.viewRecord}
                  </Link>
                  {actionFor(course.completionId, course.progress, t)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="serif text-3xl">{t.certificates}</h2>
        {dashboard.certificates.length === 0 ? (
          <div className="card competency-card mt-4 p-6">
            <h3 className="font-semibold">{t.noCertificates}</h3>
            <p className="mt-2 text-muted">{t.noCertificatesBody}</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {dashboard.certificates.map((certificate) => (
              <article key={certificate.id} className="card competency-card p-5">
                <p className="text-xs font-semibold tracking-wide text-teal">proof 180 Certificate</p>
                <h3 className="serif mt-1 text-2xl">{phrase(locale, certificate.competency.name)}</h3>
                <p className="mt-1 text-sm text-muted">
                  {phrase(locale, certificate.courseVersion.course.title)} · {certificate.courseVersion.versionLabel} ·{" "}
                  {certificate.publicId}
                </p>
                <div className="mt-3">
                  <StatusPill tone={certificate.status === "verified" ? "good" : "bad"}>
                    {phrase(locale, certificate.status === "verified" ? "Verified" : "Revoked")}
                  </StatusPill>
                </div>
                <Link className="btn btn-teal mt-4" href={`/portal/student/certificates/${certificate.publicId}`}>
                  {t.openCertificate}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
