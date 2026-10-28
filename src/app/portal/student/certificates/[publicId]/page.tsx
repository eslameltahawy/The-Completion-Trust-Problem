import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/Chrome";
import { CopyLinkButton, PrintButton } from "@/components/ShareActions";
import { requireRole } from "@/server/auth";
import { formatDate } from "@/server/format";
import { prisma } from "@/server/db";

export default async function CertificatePage({ params }: { params: Promise<{ publicId: string }> }) {
  const user = await requireRole("learner");
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
          Back to dashboard
        </Link>
        <PrintButton />
        {verified ? <CopyLinkButton value={sharePath} /> : null}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-teal">Competency Certificate</p>
      <h1 className="serif mt-2 text-4xl">{certificate.competency.name}</h1>
      <div className="mt-3">
        <StatusPill tone={verified ? "good" : "bad"}>{verified ? "Verified" : "Revoked"}</StatusPill>
      </div>
      <p className="mt-4 max-w-2xl">
        {verified
          ? "This certificate records a reviewed competency assessment. It does not guarantee employment or future job performance."
          : "This certificate was revoked and is not valid evidence of competency."}
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Certificate ID</dt>
          <dd className="font-semibold">{certificate.publicId}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Learner</dt>
          <dd className="font-semibold">{certificate.learner.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Course</dt>
          <dd className="font-semibold">
            {certificate.courseVersion.course.title} · {certificate.courseVersion.versionLabel}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Assessment date</dt>
          <dd className="font-semibold">{formatDate(certificate.attempt.submittedAt ?? certificate.issuedAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Outcome</dt>
          <dd className="font-semibold">{certificate.outcomeLabel}</dd>
        </div>
      </dl>
      <h2 className="mt-6 font-semibold">Evaluation criteria</h2>
      <p className="mt-2">{certificate.criteriaSummary}</p>
      <h2 className="mt-6 font-semibold">Assessment evidence</h2>
      <p className="mt-2">{certificate.evidenceSummary}</p>
      {!verified && certificate.revocationReason ? (
        <p className="mt-4">Revocation note: {certificate.revocationReason}</p>
      ) : null}
      <p className="mt-6 text-sm text-muted">
        Employer partners can verify this ID at {sharePath}. Answers and integrity signals are not
        included in that check.
      </p>
    </article>
  );
}
