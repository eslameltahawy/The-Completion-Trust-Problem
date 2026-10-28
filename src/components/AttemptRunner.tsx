"use client";

import { useEffect, useRef, useState } from "react";
import { integrityAction, saveAnswerAction, submitAttemptAction } from "@/app/actions/assessment";
import { SubmitButton } from "./SubmitButton";

interface RunnerQuestion {
  id: string;
  type: string;
  prompt: string;
  context: string | null;
  options: { key: string; text: string }[];
  savedValue: string;
}

export function AttemptRunner({
  attemptId,
  deadlineAt,
  integrityConsent,
  editable,
  questions,
}: {
  attemptId: string;
  deadlineAt: string;
  integrityConsent: boolean;
  editable: boolean;
  questions: RunnerQuestion[];
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((question) => [question.id, question.savedValue])),
  );
  const [status, setStatus] = useState(editable ? "Answers save as you go." : "");
  const [clock, setClock] = useState("");
  const saveTimers = useRef<Record<string, number>>({});
  const submitted = useRef(false);

  useEffect(() => {
    if (!editable) return;
    const tick = () => {
      const remainingMs = new Date(deadlineAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setClock("00:00");
        if (!submitted.current) {
          submitted.current = true;
          const formData = new FormData();
          formData.set("attemptId", attemptId);
          void submitAttemptAction(formData);
        }
        return;
      }
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setClock(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [attemptId, deadlineAt, editable]);

  useEffect(() => {
    if (!editable || !integrityConsent) return;
    const onChange = () => {
      if (document.visibilityState === "hidden") {
        void integrityAction(attemptId);
      }
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [attemptId, editable, integrityConsent]);

  function update(questionId: string, value: string) {
    setValues((current) => ({ ...current, [questionId]: value }));
    window.clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = window.setTimeout(async () => {
      setStatus("Saving...");
      const result = await saveAnswerAction({ attemptId, questionId, value });
      setStatus(result.ok ? "Saved" : result.error);
    }, 400);
  }

  return (
    <div className="grid gap-5">
      {editable ? (
        <p className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3" aria-live="polite">
          <span>Time remaining {clock}</span>
          <span>{status}</span>
        </p>
      ) : null}
      {questions.map((question, index) => (
        <fieldset key={question.id} className="card p-5">
          <legend className="font-semibold">
            {index + 1}. {question.prompt}
          </legend>
          {question.context ? <p className="mt-3 whitespace-pre-wrap text-muted">{question.context}</p> : null}
          {question.type === "multiple_choice" ? (
            <div className="mt-4 grid gap-2">
              {question.options.map((option) => (
                <label key={option.key} className="flex gap-3 rounded-xl border border-line px-3 py-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.key}
                    checked={values[question.id] === option.key}
                    disabled={!editable}
                    onChange={() => update(question.id, option.key)}
                  />
                  <span>
                    <span className="font-semibold">{option.key}. </span>
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <label className="field mt-4">
              <span className="sr-only">Response</span>
              <textarea
                rows={6}
                value={values[question.id] ?? ""}
                disabled={!editable}
                onChange={(event) => update(question.id, event.target.value)}
              />
            </label>
          )}
        </fieldset>
      ))}
      {editable ? (
        <form action={submitAttemptAction} className="card grid gap-3 p-5">
          <input type="hidden" name="attemptId" value={attemptId} />
          <label className="flex gap-3">
            <input type="checkbox" name="confirm" value="yes" required />
            <span>I have finished this attempt and want to submit it for review.</span>
          </label>
          <SubmitButton tone="teal" pendingLabel="Submitting...">
            Submit assessment
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
