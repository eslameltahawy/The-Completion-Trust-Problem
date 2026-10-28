import Link from "next/link";
import { PrintButton } from "@/components/ShareActions";
import { normalizeCertificateQuery } from "@/domain/verification";
import { formatDate } from "@/server/format";
import { verifyCertificate } from "@/server/services";

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const normalized = id === undefined ? null : normalizeCertificateQuery(id);
  const validation =
    id === undefined
      ? ""
      : !id.trim()
        ? "Enter a certificate ID."
        : !normalized
          ? "Use only letters, numbers, and hyphens, up to 40 characters."
          : "";
  const result = normalized ? await verifyCertificate(normalized) : null;

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-teal">Employer partner</p>
        <h1 className="serif text-4xl sm:text-5xl">Certificate Verification</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted">
          Check a proof 180 Certificate without creating an account. A Course Completion record is
          not a proof 180 Certificate.
        </p>
      </header>
      <form className="card grid gap-3 p-5 sm:grid-cols-[1fr_auto]" action="/portal/partner" method="get">
        <label className="field">
          <span>Certificate ID</span>
          <input name="id" defaultValue={id ?? ""} autoComplete="off" placeholder="CTC-4F8C1A9B2E" />
        </label>
        <button className="btn btn-teal self-end" type="submit">
          Verify
        </button>
      </form>
      <div className="flex flex-wrap gap-2 no-print">
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-4F8C1A9B2E">
          Verified proof 180 Certificate
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-77B3E2D1C8">
          Revoked proof 180 Certificate
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CCR-LAYLA-EXCL1">
          Course Completion record
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=att-omar-sql">
          Pending Review
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=att-yusuf-2">
          Not issued
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-DOES-NOT-EXIST">
          Unknown ID
        </Link>
      </div>
      {validation ? (
        <p className="card px-4 py-3 text-red" role="alert">
          {validation}
        </p>
      ) : null}
      {result?.outcome === "invalid" ? (
        <section className="card p-6" role="status">
          <p className="text-xs font-semibold uppercase tracking-wider text-red">Not Verified</p>
          <h2 className="serif mt-2 text-3xl">No record matched</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
        </section>
      ) : null}
      {result?.outcome === "completion_record" ? (
        <article className="sheet sheet-completion" role="status">
          <div className="no-print mb-4">
            <PrintButton />
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate">Course Completion record</p>
          <h2 className="serif mt-2 text-4xl">This is not a proof 180 Certificate</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Record ID</dt>
              <dd className="font-semibold">{result.recordId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Learner</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Course and version</dt>
              <dd className="font-semibold">
                {result.courseTitle} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Completed</dt>
              <dd className="font-semibold">{formatDate(result.completedAtIso)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Status</dt>
              <dd className="font-semibold">{result.historical ? "Historical Certificate" : result.status}</dd>
            </div>
          </dl>
          <p className="mt-6">{result.interpretation}</p>
        </article>
      ) : null}
      {result?.outcome === "assessment_status" ? (
        <article className="card p-6" role="status">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber">{result.status}</p>
          <h2 className="serif mt-2 text-3xl">No proof 180 Certificate has been issued</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Assessment ID</dt>
              <dd className="font-semibold">{result.recordId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Learner</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Course and version</dt>
              <dd className="font-semibold">
                {result.courseTitle} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Competency</dt>
              <dd className="font-semibold">{result.competencyName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Assessment method</dt>
              <dd className="font-semibold">{result.assessmentMethod}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Status</dt>
              <dd className="font-semibold">{result.status}</dd>
            </div>
          </dl>
        </article>
      ) : null}
      {result?.outcome === "verified" ? (
        <article className="sheet sheet-competency" role="status">
          <div className="no-print mb-4">
            <PrintButton />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">Verified</p>
          <h2 className="serif mt-2 text-4xl">proof 180 Certificate</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Certificate ID</dt>
              <dd className="font-semibold">{result.certificateId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Learner</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Course and version</dt>
              <dd className="font-semibold">
                {result.courseTitle} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Competency</dt>
              <dd className="font-semibold">{result.competencyName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Assessment method</dt>
              <dd className="font-semibold">{result.assessmentMethod}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Assessment date</dt>
              <dd className="font-semibold">{formatDate(result.assessmentDateIso)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Outcome</dt>
              <dd className="font-semibold">{result.outcomeLabel}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Status</dt>
              <dd className="font-semibold">{result.status}</dd>
            </div>
          </dl>
          <h3 className="mt-6 font-semibold">Evaluation criteria</h3>
          <p className="mt-2">{result.criteriaSummary}</p>
          <h3 className="mt-6 font-semibold">Assessment evidence</h3>
          <p className="mt-2">{result.evidenceSummary}</p>
        </article>
      ) : null}
      {result?.outcome === "revoked" ? (
        <article className="sheet" role="status">
          <div className="no-print mb-4">
            <PrintButton />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red">Revoked</p>
          <h2 className="serif mt-2 text-4xl">This certificate is not valid</h2>
          <p className="mt-3">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Certificate ID</dt>
              <dd className="font-semibold">{result.certificateId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Learner</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Course</dt>
              <dd className="font-semibold">
                {result.courseTitle} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Competency</dt>
              <dd className="font-semibold">{result.competencyName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Assessment method</dt>
              <dd className="font-semibold">{result.assessmentMethod}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Assessment date</dt>
              <dd className="font-semibold">{formatDate(result.assessmentDateIso)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Status</dt>
              <dd className="font-semibold">{result.status}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </div>
  );
}
