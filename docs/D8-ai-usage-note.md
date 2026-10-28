# D8 — AI Usage Note

On 28 October 2026 this repository was implemented in Cursor with the Grok coding agent, from the user's execution prompt. The agent made the product structure, the Next.js application, the sample data, the tests, and these documents. It did not call a model to grade learners. The in-product evaluator is a deterministic demo function named `demo_evaluator_v1`.

One suggestion was rejected: issue a proof 180 Certificate automatically when that demo score reached a high threshold. It was rejected because an automated line is an unvalidated hypothesis, and a score must not turn a completion or a submission into a verified competency. Reviewer approval remains the issuance gate.
