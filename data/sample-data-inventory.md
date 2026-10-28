# Sample data inventory

The demonstration set is the 27 lookup records in [sample-records.json](sample-records.json). That is the set an evaluator should use. Questions, saved responses, rubric rows, and audit rows in SQLite belong to those records. They are not extra scenarios.

Load or reload with:

```bash
npx prisma migrate deploy
npm run db:seed
```

Password for every account: `demo-pass`. People and organizations are fictional.

| Scenario | Lookup ID | Partner result |
| --- | --- | --- |
| No assessment | `CCR-AMIRA-COMM1`, `CCR-HANA-COMM01`, `CCR-YUSUF-COMM1` | Course Completion Record |
| Auto-graded quiz, issued | `CTC-4F8C1A9B2E`, `CTC-91D0E7C4A6` | Verified |
| Auto-graded quiz, not started | `CCR-HANA-DATA01` | Course Completion Record |
| Practical assessment, pending | `att-sara-disc` | Pending Review |
| Practical assessment, in progress, extended time | `att-karim-disc` | In Progress |
| Prototype integrity signal, not live monitoring | `att-omar-agile` | Returned for further review |
| Corporate learners | Omar Nasser, Sara Ibrahim, Noor Fahmy | Same rubric as self-directed learners |
| Self-directed learners | Amira, Yusuf, Layla, Hana, Karim, Rania | Rania has no completions |
| Historical Certificate | `CCR-LAYLA-EXCL1` | Completion only, Excel v1, 12 Mar 2024 |
| Issued before a revision | Layla stays on Excel v1. Current version is v2. `CCR-AMIRA-EXCL2` is the v2 completion and is not a certificate. | Version is named on the result |
| Pending review | `att-omar-sql` | Pending Review |
| Failed or exhausted | `att-yusuf-1`, `att-yusuf-2` | Not Verified / Not Issued |
| Unapproved, retry remains | `att-noor-sql` | Not Verified / Not Issued |
| Revocation policy | `CTC-77B3E2D1C8` | Revoked, internal reason withheld |
| Invalid ID | `CTC-DOES-NOT-EXIST` | Not Verified, no personal information |

Accounts are listed in the README. The reviewer is `nadia.karim@demo.local`.
