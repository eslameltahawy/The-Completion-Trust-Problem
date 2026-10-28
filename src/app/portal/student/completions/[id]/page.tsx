import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ShareActions";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { getCompletionForLearner } from "@/server/queries";

export default async function CompletionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("learner");
  const { id } = await params;
  const completion = await getCompletionForLearner(user.id, id);
  if (!completion) notFound();

  return (
    <article className="sheet sheet-completion">
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <Link className="btn btn-ghost" href="/portal/student">
          Back to dashboard
        </Link>
        <PrintButton />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate">Course Completion Record</p>
      <h1 className="serif mt-2 text-4xl">{completion.courseVersion.course.title}</h1>
      <p className="mt-3 max-w-2xl text-lg">
        This record confirms course completion. It is not a Competency Certificate and does not show
        that the learner demonstrated mastery.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Learner</dt>
          <dd className="font-semibold">{completion.learner.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Record ID</dt>
          <dd className="font-semibold">{completion.publicId}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Course version</dt>
          <dd className="font-semibold">{completion.courseVersion.versionLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Completed</dt>
          <dd className="font-semibold">{formatDate(completion.completedAt)}</dd>
        </div>
      </dl>
      <p className="mt-6">{completion.courseVersion.summary}</p>
      {completion.legacyLabel ? (
        <p className="mt-4">
          Historical label preserved: {completion.legacyLabel}. The original issue date is the
          completion date above. This import was not upgraded to a Competency Certificate.
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted">
        Employer partners cannot use this record ID to verify competency.
      </p>
    </article>
  );
}
