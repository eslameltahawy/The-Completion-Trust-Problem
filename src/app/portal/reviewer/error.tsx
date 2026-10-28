"use client";

export default function ReviewerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6" role="alert">
      <h1 className="serif text-2xl">The reviewer queue could not be loaded</h1>
      <button className="btn btn-primary mt-4" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
