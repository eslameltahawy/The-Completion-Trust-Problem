import Link from "next/link";
import { DemoBanner } from "@/components/Chrome";

const samples = [
  { id: "CTC-4F8C1A9B2E", label: "Verified competency" },
  { id: "CTC-77B3E2D1C8", label: "Revoked certificate" },
  { id: "CCR-LAYLA-EXCL1", label: "Completion record" },
  { id: "CTC-DOES-NOT-EXIST", label: "Unknown ID" },
];

export default function HomePage() {
  return (
    <>
      <DemoBanner />
      <header className="no-print border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <p className="text-sm font-semibold tracking-wide">Career 180 · Completion Trust</p>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold" aria-label="Portals">
            <Link href="/portal/student">Student</Link>
            <Link href="/portal/reviewer">Reviewer</Link>
            <Link href="/portal/partner">Employer partner</Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal">Prototype</p>
        <h1 className="serif mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">
          Completion is a record. Competency is a reviewed result.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Finishing a Career 180 course confirms that the learner completed it. It does not, by
          itself, show that the learner can perform the skill. This prototype keeps those outcomes
          apart and gives employer partners a way to verify a Competency Certificate.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="card completion-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate">Course Completion Record</p>
            <h2 className="serif mt-2 text-2xl">Finished the course</h2>
            <p className="mt-2 text-muted">
              Every eligible learner keeps a completion record. It confirms participation and
              completion for a specific course version. It is not a competency certificate.
            </p>
          </article>
          <article className="card competency-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">Competency Certificate</p>
            <h2 className="serif mt-2 text-2xl">Demonstrated the competency</h2>
            <p className="mt-2 text-muted">
              A learner may take a Competency Assessment. A certificate is issued only after review
              approves the result. It does not promise a job or future performance.
            </p>
          </article>
        </div>

        <section className="card mt-8 p-6">
          <h2 className="serif text-2xl">Certificate Verification</h2>
          <p className="mt-2 max-w-3xl text-muted">
            Employer partners do not need an account. A completion-record ID never verifies as a
            Competency Certificate.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((sample) => (
              <Link key={sample.id} className="btn btn-ghost text-sm" href={`/portal/partner?id=${sample.id}`}>
                {sample.label}
              </Link>
            ))}
          </div>
          <Link className="btn btn-teal mt-4" href="/portal/partner">
            Open the partner portal
          </Link>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link className="card p-5" href="/portal/login">
            <h2 className="font-semibold">Student portal</h2>
            <p className="mt-2 text-sm text-muted">Completion records, assessments, and certificates.</p>
          </Link>
          <Link className="card p-5" href="/portal/login">
            <h2 className="font-semibold">Reviewer queue</h2>
            <p className="mt-2 text-sm text-muted">Evidence, rubric, and the issuance decision.</p>
          </Link>
          <Link className="card p-5" href="/portal/partner">
            <h2 className="font-semibold">Employer partner</h2>
            <p className="mt-2 text-sm text-muted">Check a certificate ID in one step.</p>
          </Link>
        </section>
      </main>
    </>
  );
}
