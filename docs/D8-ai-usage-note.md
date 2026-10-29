# D8 — AI Usage Note

On 28 October 2026 this repository was implemented in Cursor with the Grok coding agent, from the user's execution prompt. It implemented the application, sample data, tests, and documents. It did not call a model to grade learners. The in-product evaluator is a deterministic demo function named `demo_evaluator_v1`.

**Existing assessments.** Suggested: reuse a sufficient assessment, and add one only when necessary. Refined: every eligible completion still gets a Course Completion record, and a proof 180 Certificate needs a pathway for that specialization. An existing completion or assessment does not establish competency. Trade-off: more design work. The prototype keeps that split.

**One assessment for every learner.** A uniform assessment was explored. The same questions and method for every specialization were rejected. Standard: the framework, the evidence, and the result presentation, with a task that fits the skill. Trade-off: less comparability across courses. The prototype uses one issuance path and different sample tasks.

**What the certificate proves.** Competency must not be read as job readiness. A proof 180 Certificate is reviewed performance against stated criteria. It does not claim professional readiness, job performance, or future success. Trade-off: a narrower promise. That limit is on the certificate in the prototype.

**Automatic issuance.** Rejected: issue a proof 180 Certificate when `demo_evaluator_v1` crossed a high score. The score is an unvalidated heuristic, so reviewer approval is the only gate. Trade-off: slower certificates. A passing proposal does not create one in the prototype.
