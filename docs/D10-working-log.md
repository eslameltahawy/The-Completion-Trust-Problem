# D10 — Working Log

Two days, local time (UTC+3). Framing on 27 October. Build and release on 28 October. No interviews were run. Open questions stay labeled as hypotheses in D1 and D3.

## 27 October — Framing

The day was product work: the trust problem, the options, and the rules that had to hold before any screen existed.

| Question | Where it landed |
| --- | --- |
| What fails if a finished course is treated as skill? | Completion and competency are different outcomes. |
| What can an employer check? | A Course Completion record confirms a course version. A proof 180 Certificate exists only after evidence and human review. |
| What must the first version refuse? | No certificate from a score. No upgrade of a historical record. Corporate enrollment is context, not a score. |
| What is still a hypothesis? | Two attempts, a 75% quiz line, partner comprehension, reviewer agreement, and the pilot cost in D1. |
| What would test those hypotheses? | The three studies in D3. They are specified, not done. |

Also held out of the prototype: a course player, camera or screen capture, a live model, and certificate expiry. Review capacity is the cost of keeping “Verified” meaningful.

## 28 October — Prototype

| Time | Result |
| --- | --- |
| 19:26 | Empty repository. The brief was the source of truth. |
| 19:30–19:47 | Next.js, Prisma, and SQLite. Trust rules, sample data, and three portals. 25 tests passed. Lint was clean. The production build succeeded. |
| 19:53 | Partner lookup separates a completion record, Pending Review, Not Verified / Not Issued, and an unknown ID. Added the validation note, the senior scenario, and 27 lookup records. |
| 19:58 | Local checks of the sample IDs matched those states. The server was then stopped. |
| 20:04 | Pushed `main` and deployed the hosted demo. No recording. |
| 20:11 | Hosted sign-in failed across servers. A signed cookie fixed it. Amira Hassan reached the student page. |
| 20:23 | Locked the two document names in the product and the documents. |
| 20:36 | Added the Arabic interface. The two document names stay in English. |
