# D4 — Prototype and Sample Data

The working prototype is this repository. The hosted demo is https://the-completion-trust-problem.vercel.app. Partner lookup of the seeded IDs was checked there on 28 October 2026. New review decisions are stored in temporary SQLite storage and may reset when a server instance is replaced. There is still no demo recording.

## Run locally

Prerequisites: Node.js 20 or newer.

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env` if it is missing. `DATABASE_URL` is a local SQLite file. `SESSION_SECRET` in the example is a demo value, not a production secret.

`npm run db:seed` reloads fictional sample rows. It does not drop the database file. If OneDrive locks `prisma/dev.db`, close other handles and seed again.

## Demo authentication

Password for every sample account: `demo-pass`.

| Account | Use |
| --- | --- |
| amira.hassan@demo.local | Issued certificate and completions that are not certificates |
| omar.nasser@demo.local | Corporate learner, pending SQL review |
| hana.mostafa@demo.local | Eligible quiz not started |
| yusuf.adel@demo.local | Failed and exhausted |
| rania.saleh@demo.local | No completions |
| nadia.karim@demo.local | Reviewer |

A banner states that this is not Career 180 production.

## Partner checks

No account. On `/portal/partner`:

- `CTC-4F8C1A9B2E` — Verified, Amira Hassan, Data Literacy
- `CTC-91D0E7C4A6` — Verified, Sara Ibrahim
- `CCR-LAYLA-EXCL1` — Historical Certificate and Course Completion record for Excel v1. Not a proof 180 Certificate.
- `att-omar-sql` — Pending Review. No certificate issued.
- `att-yusuf-2` — Not Verified / Not Issued.
- `CTC-77B3E2D1C8` — Revoked, Noor Fahmy
- `CTC-DOES-NOT-EXIST` — unknown ID, no personal information

## Learner story

The flow is [D5-learner-certificate-flow.mmd](D5-learner-certificate-flow.mmd). Hana is the sample for the happy path. She already has a Course Completion record for Data Literacy. That record is not a proof 180 Certificate.

She signs in and chooses **Get proof 180 Certificate**. If the course has no assessment, the state stays Assessment Design Required and nothing starts. If her completion is an older version, the state stays Not Yet Eligible and the old record is unchanged. If she has used both attempts, she can only view the earlier result.

On an eligible course she reads the rules. The attempt stays closed until two checks pass. The browser must be Google Chrome. She must share the entire screen through Chrome’s picker, `getDisplayMedia()`. A window, a tab, or a dismissed picker does not start the attempt. The camera stays off.

Once the monitor is shared, the attempt is In Progress. One still image is stored at the start, then one every five minutes. There is no video. If she stops the share from Chrome’s bar, the attempt pauses until she shares the monitor again. She answers and submits. The state becomes Pending Review. The demo score may propose pass or fail. It does not create a certificate.

Nadia opens the attempt. She sees the answers, the rubric, the proposal, and the stills in time order. She does not watch a recording. Approval with a written reason issues one proof 180 Certificate. Rejection leaves Not Verified / Not Issued. Return keeps the attempt with the reviewer. Hana can then open the certificate, and a partner can verify its public ID. The partner never sees the answers or the stills.

The hosted demo does not open Chrome’s share dialog yet. The click-through below still starts the quiz without that gate.

## Learner path in the demo

Sign in as Hana. Data Literacy shows Assessment Not Started. Open **Get proof 180 Certificate**, acknowledge the rules, and start. Correct sample key, for the demo only: B, B, B, A. Submit. The state becomes Pending Review and no certificate appears. Communication stays Assessment Design Required.

Amira already shows the split between her completion records and CTC-4F8C1A9B2E. Layla's Excel record stays on version 1.

## Reviewer path

Sign in as Nadia. Open Omar Nasser's SQL attempt or Sara Ibrahim's practical. Approve with a reason, or reject, or return. Then sign in as that learner, open the new certificate ID, and verify it as a partner. A new ID is generated at approval, so copy it from the certificate. Do not expect the seed IDs to change.

## Sample data

Seed: `prisma/seed.ts`. Readable export: [../data/sample-records.json](../data/sample-records.json). Inventory: [../data/sample-data-inventory.md](../data/sample-data-inventory.md).

## Three-minute recording plan

Not recorded. Suggested order: partner verifies CTC-4F8C1A9B2E, then CCR-LAYLA-EXCL1; Amira's dashboard shows the two sections; Nadia approves one pending attempt; the new ID verifies. Keep it under three minutes.

Recording link: **not created**. Replace this sentence only after a real file or URL exists.
