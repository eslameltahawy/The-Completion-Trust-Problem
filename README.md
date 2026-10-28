# Career 180 Completion Trust

Completing a course confirms that a learner finished it. It does not show that they can do the skill. This prototype keeps those outcomes apart.

A **Course Completion record** confirms completion of a course version. A **proof 180 Certificate** exists only after a competency assessment and a reviewer's approval. Employer partners can verify a certificate ID without an account. A completion-record ID never verifies as competency.

The repository started empty. This application was built for the Career 180 product challenge. Demo accounts are local sample data. They are not connected to Career 180 production systems.

## Journeys

- Student, `/portal/student`: completions and certificates are separate. The learner can open a completion record, start an eligible assessment, and see review status.
- Reviewer, `/portal/reviewer`: queue, evidence, rubric, proposed result, and approve, reject, or return with a reason.
- Employer partner, `/portal/partner`: enter an ID and see a proof 180 Certificate (Verified or Revoked), a Course Completion record, Pending Review, Not Verified / Not Issued, or an unknown ID with no personal information.

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, and SQLite. Business rules live in `src/domain` and `src/server`. The interface does not decide issuance. The evaluator is `demo_evaluator_v1`, a deterministic local function behind an evaluator interface. It does not call a model.

Learners and reviewers share one user table, distinguished by role. Expiration is not implemented. Revocation is.

## Setup

Requirements: Node.js 20+.

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Copy `.env.example` to `.env` first if needed.

- `DATABASE_URL` — local SQLite file, default `file:./dev.db` under `prisma/`
- `SESSION_SECRET` — demo cookie secret in the example file, not a production secret

The app is meant to run over local HTTP, so the demo session cookie is not marked Secure.

`npm run db:seed` clears and reloads fictional rows. It does not delete the database file. If OneDrive locks `prisma/dev.db`, close the handle and seed again.

## Demo accounts

Password: `demo-pass`.

- `amira.hassan@demo.local` — learner with an issued certificate and completions that are not certificates
- `omar.nasser@demo.local` — corporate learner, SQL assessment pending review
- `hana.mostafa@demo.local` — eligible quiz not started
- `yusuf.adel@demo.local` — failed attempts, limit exhausted
- `rania.saleh@demo.local` — no completed courses
- `nadia.karim@demo.local` — reviewer

Partner checks need no login. Try these IDs:

- `CTC-4F8C1A9B2E` — Verified proof 180 Certificate
- `CCR-LAYLA-EXCL1` — Historical Certificate and Course Completion record, not competency
- `att-omar-sql` — Pending Review, no certificate issued
- `att-yusuf-2` — Not Verified / Not Issued
- `CTC-77B3E2D1C8` — Revoked
- `CTC-DOES-NOT-EXIST` — unknown ID, no personal information

The 27 demonstration records are in [data/sample-records.json](data/sample-records.json). The scenario map is in [data/sample-data-inventory.md](data/sample-data-inventory.md).

## Routes

- `/` — the distinction, in short
- `/portal/login`
- `/portal/student`
- `/portal/reviewer`
- `/portal/partner`

## Checks

```bash
npm test
npm run lint
npm run build
```

## Limits

- No production login, course player, camera, screen capture, or live AI grader.
- Written answers are checked for explicit expected elements. That is a demo heuristic. Reviewers can override it with a reason.
- Numeric pass marks are unvalidated hypotheses.
- Refreshing a partner result records another verification event.
- The hosted demo is https://the-completion-trust-problem.vercel.app. Use **العربية** in the header to switch the interface to Arabic. The document names stay Course Completion record and proof 180 Certificate.

## Deliverables

- [D1 Decision memo](docs/D1-decision-memo.md)
- [D2 MVP PRD](docs/D2-mvp-prd.md)
- [D3 Discovery plan](docs/D3-discovery-validation-plan.md)
- [D4 Prototype and sample data](docs/D4-prototype-and-sample-data.md)
- [D5 Trust model](docs/D5-trust-model.mmd)
- [D5 Certificate lifecycle](docs/D5-certificate-lifecycle.mmd)
- [D5 Partner verification](docs/D5-partner-verification-flow.mmd)
- [D6 Metrics](docs/D6-metrics-table.md)
- [D7 Policy register](docs/D7-edge-case-policy-register.md)
- [D8 AI note](docs/D8-ai-usage-note.md)
- [D9 Unasked question](docs/D9-unasked-question.md)
- [D10 Working log](docs/D10-working-log.md)
- [Validation and iteration note](docs/validation-and-iteration-note.md)
- [Senior scenario](docs/senior-bonus-scenario.md)
- [Sample records](data/sample-records.json)
- [Sample-data inventory](data/sample-data-inventory.md)
- [Submission checklist](docs/submission-checklist.md)

Repository: https://github.com/eslameltahawy/The-Completion-Trust-Problem.git

Hosted prototype: https://the-completion-trust-problem.vercel.app/portal/partner
