import Link from "next/link";
import { StatusPill } from "@/components/Chrome";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDateTime } from "@/server/format";
import { getReviewQueue, stateLabel } from "@/server/queries";

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
  const locale = await getLocale();
  const t = copy(locale);
  const filters = await searchParams;
  const attempts = await getReviewQueue(filters);
  const statuses = [
    ["", t.queueDefault],
    ["pending_review", phrase(locale, "Pending Review")],
    ["returned", phrase(locale, "Returned for further review")],
    ["issued", phrase(locale, "Verified")],
    ["not_issued", phrase(locale, "Not Verified / Not Issued")],
  ];

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold tracking-wide text-muted">{t.reviewer}</p>
        <h1 className="serif text-4xl">{t.assessmentQueue}</h1>
        <p className="mt-2 max-w-3xl text-muted">{t.reviewerLead}</p>
      </header>
      <form className="card grid gap-3 p-4 md:grid-cols-[1fr_16rem_auto]" method="get">
        <label className="field">
          <span>{t.search}</span>
          <input name="q" defaultValue={filters.q ?? ""} />
        </label>
        <label className="field">
          <span>{t.status}</span>
          <select name="status" defaultValue={filters.status ?? ""}>
            {statuses.map(([value, label]) => (
              <option key={value || "queue"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary self-end" type="submit">
          {t.filter}
        </button>
      </form>
      {attempts.length === 0 ? (
        <p className="card p-6">{t.noMatches}</p>
      ) : (
        <ul className="grid gap-3">
          {attempts.map((attempt) => (
            <li key={attempt.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{attempt.learner.name}</h2>
                  <p className="text-sm text-muted">
                    {phrase(locale, attempt.assessmentVersion.definition.courseVersion.course.title)} · {t.attemptWord}{" "}
                    {attempt.attemptNumber} · {attempt.id}
                  </p>
                  <p className="text-sm text-muted">
                    {attempt.submittedAt ? formatDateTime(attempt.submittedAt, locale) : t.notSubmitted}
                    {attempt.learner.organization ? ` · ${attempt.learner.organization}` : ""}
                  </p>
                </div>
                <StatusPill tone={tone(attempt.state)}>{phrase(locale, stateLabel(attempt.state))}</StatusPill>
              </div>
              <Link className="btn btn-ghost mt-3" href={`/portal/reviewer/attempts/${attempt.id}`}>
                {t.open}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
