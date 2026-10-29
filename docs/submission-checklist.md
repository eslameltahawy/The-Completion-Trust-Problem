# Submission Checklist

Status was checked against the code and the test run in this session. "Verified" means a test or a local run covered it. "Implemented" means the behavior exists and the automated test did not click the browser path.

| Requirement | Artifact | Status |
| --- | --- | --- |
| Completion is not a proof 180 Certificate | Student dashboard, completion page, D1 | Verified by workflow test and seed |
| Assessment only for an owned, matching completion | `startAssessment` | Verified |
| Submit moves to Pending Review and does not issue | `submitAttempt` | Verified |
| Certificate only after approval, once | `decideReview` | Verified |
| Reject does not issue | `decideReview` | Verified |
| Valid ID verifies, with method and criteria | Partner page, `verifyCertificate` | Verified by workflow test and local HTTP (`CTC-4F8C1A9B2E`) |
| Completion record is shown as completion, not competency | Partner page | Verified by workflow test and local HTTP (`CCR-LAYLA-EXCL1`) |
| Pending and not-issued IDs are not Verified | Partner page | Verified by workflow test and local HTTP (`att-omar-sql`, `att-yusuf-2`) |
| Invalid ID leaks no personal data | Partner page | Verified by local HTTP (`CTC-DOES-NOT-EXIST`) |
| Stakeholder cost assumption | `docs/D1-decision-memo.md` | Written. Not Career 180 financials |
| Validation note | `docs/validation-and-iteration-note.md` | Written. No user research |
| Senior scenario | `docs/senior-bonus-scenario.md` | Written |
| 27 demonstration lookup records | `data/sample-records.json` | Written |
| Historical import is not an upgrade and is idempotent | `migrateHistoricalCompletions` | Verified |
| Course revision keeps version 1 | Excel v1 / v2, eligibility | Verified |
| Revoked certificate hides the internal reason | Partner result | Verified |
| No camera, no screen capture, no fake AI call | Attempt consent copy, `demo_evaluator_v1` | Implemented |
| Reviewer queue, filter, and reasoned decision | `/portal/reviewer` | Implemented |
| Partner needs no account | `/portal/partner` | Implemented |
| Printable completion and certificate | Print actions | Implemented |
| At least 30 sample records and scenario coverage | `prisma/seed.ts`, sample-data inventory | Verified, 66 core records |
| D1 decision memo | `docs/D1-decision-memo.md` | Written |
| D2 MVP PRD | `docs/D2-mvp-prd.md` | Written |
| D3 discovery plan | `docs/D3-discovery-validation-plan.md` | Written |
| D4 prototype guide | `docs/D4-prototype-and-sample-data.md` | Written. Hosted at https://the-completion-trust-problem.vercel.app. No recording |
| D5 three diagrams | `docs/D5-*.mmd` | Written |
| D6 metrics | `docs/D6-metrics-table.md` | Written |
| D7 policy register | `docs/D7-edge-case-policy-register.md` | Written |
| D8 AI note | `docs/D8-ai-usage-note.md` | Written |
| D9 unasked question | `docs/D9-unasked-question.md` | Written |
| D10 working log | `docs/D10-working-log.md` | Framing on 27 Oct; build and release on 28 Oct |
| Lint, tests, production build | package scripts | 28 Oct 2026 session: `npm test` 25 passed; `npm run lint` clean; `npm run build` succeeded |
| Demo recording under three minutes | D4 plan | Not done. External |
| Push or deploy | `main` on GitHub and Vercel production | Pushed and deployed on 28 Oct 2026. Live partner checks passed for a verified ID, a completion record, and an unknown ID |
