"use client";

export default function StudentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6" role="alert">
      <h1 className="serif text-2xl">The student portal could not be loaded</h1>
      <p className="mt-2 text-muted">
        Return to the dashboard or try again. If this is a fresh checkout, load the sample data first.
      </p>
      <button className="btn btn-primary mt-4" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
