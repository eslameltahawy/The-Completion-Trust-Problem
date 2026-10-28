import Link from "next/link";
import { PrintButton } from "@/components/ShareActions";
import { normalizeCertificateQuery } from "@/domain/verification";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { formatDate } from "@/server/format";
import { verifyCertificate } from "@/server/services";

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const locale = await getLocale();
  const t = copy(locale);
  const normalized = id === undefined ? null : normalizeCertificateQuery(id);
  const validation =
    id === undefined
      ? ""
      : !id.trim()
        ? locale === "ar"
          ? "أدخل معرّف الوثيقة."
          : "Enter a certificate ID."
        : !normalized
          ? locale === "ar"
            ? "استخدم الحروف والأرقام والشرطات فقط، وبحد أقصى 40 حرفًا."
            : "Use only letters, numbers, and hyphens, up to 40 characters."
          : "";
  const result = normalized ? await verifyCertificate(normalized, locale) : null;

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold tracking-wide text-teal">{t.partner}</p>
        <h1 className="serif text-4xl sm:text-5xl">{t.verificationTitle}</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted">{t.partnerLead}</p>
      </header>
      <form className="card grid gap-3 p-5 sm:grid-cols-[1fr_auto]" action="/portal/partner" method="get">
        <label className="field">
          <span>{t.certificateId}</span>
          <input name="id" defaultValue={id ?? ""} autoComplete="off" placeholder="CTC-4F8C1A9B2E" />
        </label>
        <button className="btn btn-teal self-end" type="submit">
          {t.verify}
        </button>
      </form>
      <div className="flex flex-wrap gap-2 no-print">
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-4F8C1A9B2E">
          proof 180 Certificate
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-77B3E2D1C8">
          {locale === "ar" ? "proof 180 Certificate مُلغاة" : "Revoked proof 180 Certificate"}
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CCR-LAYLA-EXCL1">
          Course Completion record
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=att-omar-sql">
          {phrase(locale, "Pending Review")}
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=att-yusuf-2">
          {phrase(locale, "Not Verified / Not Issued")}
        </Link>
        <Link className="btn btn-ghost text-sm" href="/portal/partner?id=CTC-DOES-NOT-EXIST">
          {t.unknownId}
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
          <h2 className="serif mt-2 text-3xl">{t.noMatch}</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
        </section>
      ) : null}
      {result?.outcome === "completion_record" ? (
        <article className="sheet sheet-completion" role="status">
          <div className="no-print mb-4">
            <PrintButton />
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate">Course Completion record</p>
          <h2 className="serif mt-2 text-4xl">{t.notACertificate}</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">{t.recordId}</dt>
              <dd className="font-semibold">{result.recordId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.learner}</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.courseVersion}</dt>
              <dd className="font-semibold">
                {phrase(locale, result.courseTitle)} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.completed}</dt>
              <dd className="font-semibold">{formatDate(result.completedAtIso, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.status}</dt>
              <dd className="font-semibold">{result.historical ? phrase(locale, "Historical Certificate") : result.status}</dd>
            </div>
          </dl>
          <p className="mt-6">{result.interpretation}</p>
        </article>
      ) : null}
      {result?.outcome === "assessment_status" ? (
        <article className="card p-6" role="status">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber">{phrase(locale, result.status)}</p>
          <h2 className="serif mt-2 text-3xl">{t.noCertificateIssued}</h2>
          <p className="mt-3 max-w-2xl">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">{t.assessmentId}</dt>
              <dd className="font-semibold">{result.recordId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.learner}</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.courseVersion}</dt>
              <dd className="font-semibold">
                {phrase(locale, result.courseTitle)} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.competency}</dt>
              <dd className="font-semibold">{phrase(locale, result.competencyName)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.method}</dt>
              <dd className="font-semibold">{phrase(locale, result.assessmentMethod)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.status}</dt>
              <dd className="font-semibold">{phrase(locale, result.status)}</dd>
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
              <dt className="text-sm text-muted">{t.certificateId}</dt>
              <dd className="font-semibold">{result.certificateId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.learner}</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.courseVersion}</dt>
              <dd className="font-semibold">
                {phrase(locale, result.courseTitle)} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.competency}</dt>
              <dd className="font-semibold">{phrase(locale, result.competencyName)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.method}</dt>
              <dd className="font-semibold">{phrase(locale, result.assessmentMethod)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.assessmentDate}</dt>
              <dd className="font-semibold">{formatDate(result.assessmentDateIso, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.outcome}</dt>
              <dd className="font-semibold">{phrase(locale, result.outcomeLabel)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.status}</dt>
              <dd className="font-semibold">{phrase(locale, result.status)}</dd>
            </div>
          </dl>
          <h3 className="mt-6 font-semibold">{t.criteria}</h3>
          <p className="mt-2">{phrase(locale, result.criteriaSummary)}</p>
          <h3 className="mt-6 font-semibold">{t.evidence}</h3>
          <p className="mt-2">{phrase(locale, result.evidenceSummary)}</p>
        </article>
      ) : null}
      {result?.outcome === "revoked" ? (
        <article className="sheet" role="status">
          <div className="no-print mb-4">
            <PrintButton />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red">Revoked</p>
          <h2 className="serif mt-2 text-4xl">{t.certificateInvalid}</h2>
          <p className="mt-3">{result.message}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">{t.certificateId}</dt>
              <dd className="font-semibold">{result.certificateId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.learner}</dt>
              <dd className="font-semibold">{result.learnerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.course}</dt>
              <dd className="font-semibold">
                {phrase(locale, result.courseTitle)} · {result.versionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.competency}</dt>
              <dd className="font-semibold">{phrase(locale, result.competencyName)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.method}</dt>
              <dd className="font-semibold">{phrase(locale, result.assessmentMethod)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.assessmentDate}</dt>
              <dd className="font-semibold">{formatDate(result.assessmentDateIso, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">{t.status}</dt>
              <dd className="font-semibold">{phrase(locale, result.status)}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </div>
  );
}
