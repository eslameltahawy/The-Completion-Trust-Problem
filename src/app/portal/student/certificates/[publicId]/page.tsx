import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/Chrome";
import { CopyLinkButton, PrintButton } from "@/components/ShareActions";
import { phrase } from "@/i18n/glossary";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { prisma } from "@/server/db";

export default async function CertificatePage({ params }: { params: Promise<{ publicId: string }> }) {
  const user = await requireRole("learner");
  const locale = await getLocale();
  const t = copy(locale);
  const { publicId } = await params;
  const certificate = await prisma.competencyCertificate.findFirst({
    where: { publicId, learnerId: user.id },
    include: {
      learner: true,
      competency: true,
      courseVersion: { include: { course: true } },
      attempt: true,
    },
  });
  if (!certificate) notFound();
  const verified = certificate.status === "verified";
  const sharePath = `/portal/partner?id=${certificate.publicId}`;

  return (
    <article className={verified ? "sheet sheet-competency" : "sheet"}>
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <Link className="btn btn-ghost" href="/portal/student">
          {t.backDashboard}
        </Link>
        <PrintButton />
        {verified ? <CopyLinkButton value={sharePath} /> : null}
      </div>
      <p className="text-xs font-semibold tracking-wide text-teal">proof 180 Certificate</p>
      <h1 className="serif mt-2 text-4xl">{phrase(locale, certificate.competency.name)}</h1>
      <div className="mt-3">
        <StatusPill tone={verified ? "good" : "bad"}>{phrase(locale, verified ? "Verified" : "Revoked")}</StatusPill>
      </div>
      <p className="mt-4 max-w-2xl">{verified ? t.employment : t.revokedBody}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">{t.certificateId}</dt>
          <dd className="font-semibold">{certificate.publicId}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.learner}</dt>
          <dd className="font-semibold">{certificate.learner.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.course}</dt>
          <dd className="font-semibold">
            {phrase(locale, certificate.courseVersion.course.title)} · {certificate.courseVersion.versionLabel}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.assessmentDate}</dt>
          <dd className="font-semibold">{formatDate(certificate.attempt.submittedAt ?? certificate.issuedAt, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t.outcome}</dt>
          <dd className="font-semibold">{phrase(locale, certificate.outcomeLabel)}</dd>
        </div>
      </dl>
      <h2 className="mt-6 font-semibold">{t.criteria}</h2>
      <p className="mt-2">{phrase(locale, certificate.criteriaSummary)}</p>
      <h2 className="mt-6 font-semibold">{t.evidence}</h2>
      <p className="mt-2">{phrase(locale, certificate.evidenceSummary)}</p>
      {!verified && certificate.revocationReason ? (
        <p className="mt-4">
          {t.revocationNote}: {certificate.revocationReason}
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted">{t.partnerShare}</p>
    </article>
  );
}
