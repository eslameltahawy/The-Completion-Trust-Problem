# D2 — MVP PRD

## Users and use cases

Learners need a completion record that does not pretend to be mastery, and a clear way to attempt a competency assessment. Reviewers need a queue, the answers, the rubric, the proposal, and a recorded decision. Employer partners need to verify a certificate ID with no account. Career 180 operators need historical completions to stay completions.

Demo authentication is local and labeled. It is not Career 180 production identity. Partners are not asked to sign in.

## Objectives and exclusions

The MVP must show the full critical journey: completion record, assessment, pending review, reviewer decision, certificate, and partner verification. It must block illegal transitions and a second certificate for the same attempt.

Excluded: course player, production single sign-on, real model calls, camera or screen capture, certificate expiry, payment, and any claim about hiring outcomes.

## Functional requirements

- Show completed courses and proof 180 Certificates as separate lists.
- Open and print a Course Completion record that says it is not a proof 180 Certificate.
- Start an assessment only when the learner owns the completion and the assessment targets that course version.
- Require an acknowledgement of rules, attempt limit, time limit, privacy, and review.
- Offer optional tab-visibility signals. Never use the camera or capture the screen.
- Save answers, submit once, and move the attempt to Pending Review.
- Let a reviewer approve, reject, or return, with a reason of at least 12 characters.
- Issue a certificate only on approval. Reject leaves Not Verified / Not Issued.
- Let a partner submit an ID and see Verified, Revoked, a Course Completion record, Pending Review, Not Verified / Not Issued, or an unknown ID.
- Keep answers, integrity events, and reviewer notes out of the partner view.
- Import a legacy completion without creating a proof 180 Certificate.

## States

Assessment Not Started, In Progress, Submitted, Pending Review, Returned for further review, Verified, Not Verified / Not Issued. Certificates are Verified or Revoked. Courses may also be Assessment Design Required or Not Yet Eligible.

Allowed attempt moves: In Progress to Submitted; Submitted to Pending Review; Pending Review to Verified, Not Verified, or Returned; Returned to Verified or Not Verified. A Verified certificate may move to Revoked. Other moves are rejected.

## Data model

SQLite via Prisma. Learners and reviewers share `User`, distinguished by role. Core records cover course versions, completion records, legacy imports, competencies, assessment definitions and versions, questions, attempts, answers, rubric results, evidence, integrity events, reviewer decisions, certificates, verification events, and an audit log. Expiration is not modeled. A certificate is unique per attempt.

## Historical migration

Legacy rows become Course Completion records linked by the legacy ID. The course version and original date stay. A second run links or skips. It never writes a proof 180 Certificate. Sample data only.

## Acceptance criteria

- Given Amira's Data Literacy completion, when she opens the dashboard, then she sees a completion record and, separately, certificate CTC-4F8C1A9B2E.
- Given Workplace Communication, when a learner looks for a certificate action, then the state is Assessment Design Required and no attempt starts.
- Given Layla's Excel version 1 record, when she requests the version 2 quiz, then the state is Not Yet Eligible and the record still points at version 1.
- Given a learner who does not own the completion, when they start an assessment, then the server refuses.
- Given a submitted quiz with a passing proposal, when no reviewer has approved it, then no certificate exists and the state is Pending Review.
- Given reviewer approval, when issuance runs, then one certificate is created and a second approval fails.
- Given rejection, when the decision is saved, then no certificate exists.
- Given CTC-4F8C1A9B2E, when a partner verifies it, then the result is Verified and includes name, course, competency, date, criteria, and a short evidence summary.
- Given CCR-LAYLA-EXCL1, when a partner verifies it, then the result is a Historical Certificate and a Course Completion record for Excel v1, names Layla Farouk, and does not present competency.
- Given att-omar-sql, when a partner verifies it, then the result is Pending Review and not a proof 180 Certificate.
- Given att-yusuf-2, when a partner verifies it, then the result is Not Verified / Not Issued.
- Given CTC-DOES-NOT-EXIST, when a partner verifies it, then the result is Not Verified and includes no personal information.
- Given CTC-77B3E2D1C8, when a partner verifies it, then the result is Revoked and the revocation note is absent.
- Given the historical import runs twice, when counts are compared, then completion rows do not increase the second time and certificate count stays unchanged by the import.

## Errors and edges

Empty learner, ineligible course, expired timer, duplicate submit, exhausted attempts, invalid ID characters, and unauthorized review are handled with explicit messages. A timer expiry submits saved answers once. Duplicate submit does not create a second evaluation.

## Dependencies and constraints

Node.js, a local SQLite file, and the seeded demo password. No paid APIs. The demo evaluator is a deterministic element and key check. Its method name is stored on every result. Written-answer matching is a demo heuristic, not a fair grader of novel wording. Reviewers can override it with a reason.
