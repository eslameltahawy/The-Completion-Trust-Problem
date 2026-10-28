# D10 — Working Log

One working session on 28 October 2026. Times are local (UTC+3) and only where the session actually showed them. No earlier sessions are claimed.

- About 19:26. Connected the empty GitHub repository and confirmed there was no existing application or brief in the repo. The chat prompt is the source of truth.
- About 19:30–19:47. Chose the Next.js, Prisma, and SQLite stack, implemented the trust rules, sample data, and three portals, and ran the test suite. Result at 19:47: 25 tests passed. Lint was clean and the production build succeeded in that same session. Route checks used `next start`.
- About 19:53. A second pass on the same date compared the prototype with the fuller brief. The partner page now separates a Course Completion record, Pending Review, Not Verified / Not Issued, and an unknown ID. D1 now states the review-cost assumption and that corporate enrollment is not a competency score. Added the validation note, the senior scenario, and `data/sample-records.json` (27 lookup records). No user research was added.
- About 19:58. Lint was clean and `npm run build` succeeded. Local HTTP checks of `CTC-4F8C1A9B2E`, `CCR-LAYLA-EXCL1`, `att-omar-sql`, `att-yusuf-2`, `CTC-DOES-NOT-EXIST`, and `CTC-77B3E2D1C8` matched those states. The server was then stopped. No browser session was available.
- About 20:04. Committed and pushed `main`. Deployed to https://the-completion-trust-problem.vercel.app. Live checks of `CTC-4F8C1A9B2E`, `CCR-LAYLA-EXCL1`, and `CTC-DOES-NOT-EXIST` returned the expected pages. No recording was made.
- About 20:11. Demo sign-in failed on the hosted site because the session row lived in one server's temporary database and the next request did not see it. Sign-in now uses a signed cookie and reads the user from the seeded record. Cookie tests passed. A live check with `demo-pass` redirected to the student page and showed Amira Hassan. A wrong password stayed on the login page.
- About 20:23. The completion document is named Course Completion record. The competency credential is named proof 180 Certificate. Those names are used in the interface, sample data, and documents.

Scope cuts, and why: no course player, because the journey starts from completions; no camera or screen capture, because they could not be done honestly; no live model call, because none was configured; no certificate expiry, to keep the state model small; human review required for every certificate, because auto-issue would recreate the trust problem.
