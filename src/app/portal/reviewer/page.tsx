import Link from "next/link";
import { StatusPill } from "@/components/Chrome";
import { requireRole } from "@/server/auth";
import { formatDateTime } from "@/server/format";
import { getReviewQueue, stateLabel } from "@/server/queries";

const statuses = [
  ["", "Queue: Pending Review and returned"],
  ["pending_review", "Pending Review"],
  ["returned", "Returned for further review"],
  ["issued", "Verified"],
  ["not_issued", "Not Verified / Not Issued"],
];

function tone(state: string): "neutral" | "pending" | "good" | "bad" {
  if (state === "issued") return "good";
  if (state === "not_issued") return "bad";
  if (state === "pending_review" || state === "returned") return "pending";
  return "neutral";
}

export default async function ReviewerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireRole("reviewer");
  const filters = await searchParams;
  const attempts = await getReviewQueue(filters);

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Reviewer</p>
        <h1 className="serif text-4xl">Assessment queue</h1>
        <p className="mt-2 max-w-3xl text-muted">
          A proposed score never issues a proof 180 Certificate. Approval, rejection, and return
          each require a written reason.
        </p>
      </header>
      <form className="card grid gap-3 p-4 md:grid-cols-[1fr_16rem_auto]" method="get">
        <label className="field">
          <span>Search learner, course, or ID</span>
          <input name="q" defaultValue={filters.q ?? ""} />
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={filters.status ?? ""}>
            {statuses.map(([value, label]) => (
              <option key={value || "queue"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary self-end" type="submit">
          Filter
        </button>
      </form>
      {attempts.length === 0 ? (
        <p className="card p-6">No assessments match this filter.</p>
      ) : (
        <ul className="grid gap-3">
          {attempts.map((attempt) => (
            <li key={attempt.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{attempt.learner.name}</h2>
                  <p className="text-sm text-muted">
                    {attempt.assessmentVersion.definition.courseVersion.course.title} · Attempt{" "}
                    {attempt.attemptNumber} · {attempt.id}
                  </p>
                  <p className="text-sm text-muted">
                    {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "Not submitted"}
                    {attempt.learner.organization ? ` · ${attempt.learner.organization}` : ""}
                  </p>
                </div>
                <StatusPill tone={tone(attempt.state)}>{stateLabel(attempt.state)}</StatusPill>
              </div>
              <Link className="btn btn-ghost mt-3" href={`/portal/reviewer/attempts/${attempt.id}`}>
                Open assessment
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
