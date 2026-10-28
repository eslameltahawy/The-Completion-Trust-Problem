# Validation and Iteration Note

No learners, employer partners, instructors, or operators have been interviewed. Nothing in this note is product-market validation.

## Decisions

Completion and competency are separate. A proof 180 Certificate requires reviewer approval. Courses without an assessment stay at Assessment Design Required. Historical certificates stay completion records for the version that was completed. Corporate enrollment is not a competency score. The review cost is carried by the product and operations budget, not by cutting completion payouts. The dollar figure in D1 is an assumption.

## Still unvalidated

Whether partners understand the partner page. Whether they treat a missing certificate as a negative signal. Whether reviewers agree and finish inside five business days. Whether the sample quiz and practical task are acceptable evidence. Whether two attempts and a 75% quiz line are fair. Whether $30 an hour and 200 reviews a month are realistic.

## What was actually tested

Implementation tests only. On 28 October 2026, `npm test` passed 25 tests, including issuance only after approval, unknown IDs without personal data, a completion record shown as completion, and a submitted attempt shown as Pending Review. `npm run lint` and `npm run build` were run in the same effort. No usability session was held.

## What changed because of a finding

The automated checks did not discover a user need. One product rule was tightened while matching this brief to the prototype: a completion-record ID is now labeled as a Course Completion record, with version and historical context, instead of using the same screen as an unknown ID. Unknown IDs still show no personal information. That was a specification change, not interview feedback.

## Next

Run the three studies in D3 before treating the wording, the review load, or the assessment tasks as settled. Do not describe those studies as complete.
