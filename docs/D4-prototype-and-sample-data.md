# D4 — Prototype and Sample Data

The working prototype is this repository. There is no hosted URL and no demo recording yet. Both are external steps.

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
- `CCR-LAYLA-EXCL1` — Historical Certificate and Course Completion Record for Excel v1. Not a Competency Certificate.
- `att-omar-sql` — Pending Review. No certificate issued.
- `att-yusuf-2` — Not Verified / Not Issued.
- `CTC-77B3E2D1C8` — Revoked, Noor Fahmy
- `CTC-DOES-NOT-EXIST` — unknown ID, no personal information

## Learner path

Sign in as Hana. Data Literacy shows Assessment Not Started. Open **Get Competency Certificate**, acknowledge the rules, and start. Correct sample key, for the demo only: B, B, B, A. Submit. The state becomes Pending Review and no certificate appears. Communication stays Assessment Design Required.

Amira already shows the split between her completion records and CTC-4F8C1A9B2E. Layla's Excel record stays on version 1.

## Reviewer path

Sign in as Nadia. Open Omar Nasser's SQL attempt or Sara Ibrahim's practical. Approve with a reason, or reject, or return. Then sign in as that learner, open the new certificate ID, and verify it as a partner. A new ID is generated at approval, so copy it from the certificate. Do not expect the seed IDs to change.

## Sample data

Seed: `prisma/seed.ts`. Readable export: [../data/sample-records.json](../data/sample-records.json). Inventory: [../data/sample-data-inventory.md](../data/sample-data-inventory.md).

## Three-minute recording plan

Not recorded. Suggested order: partner verifies CTC-4F8C1A9B2E, then CCR-LAYLA-EXCL1; Amira's dashboard shows the two sections; Nadia approves one pending attempt; the new ID verifies. Keep it under three minutes.

Recording link: **not created**. Replace this sentence only after a real file or URL exists.
