"use client";

export default function PartnerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6" role="alert">
      <h1 className="serif text-2xl">Verification could not be completed</h1>
      <p className="mt-2 text-muted">Try the certificate ID again.</p>
      <button className="btn btn-primary mt-4" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
