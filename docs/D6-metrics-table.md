# D6 — Metrics

Thresholds are hypotheses. No baseline exists. Do not manage the team on certificates issued or on the pass rate.

| Metric | Definition and calculation | Source and cadence | Threshold and action |
| --- | --- | --- | --- |
| **Trusted distinction rate** (North Star, leading) | Share of partner checks of a Verified certificate where the partner confirms the result was enough to tell competency from completion. Confirmations divided by those Verified checks. | Partner page event plus a one-question follow-up. Weekly. | Below 70% for two weeks: stop copy changes that praise issuance volume and retest the result language with partners. |
| Reviewer disagreement | Share of final decisions that change the demo proposal. Material changes divided by decisions. | `ReviewerDecision.materialChange`. Weekly. | Above 25%: the heuristic is not a usable proposal. Fix the rubric before adding courses. Do not auto-issue to reduce the rate. |
| Median queue age | Median hours from submission to the latest decision, for items decided that week. Also watch the oldest Pending Review item. | Attempt timestamps. Twice a week. | Median above 5 business days, or any item older than 10: pause new assessment launches until capacity or scope changes. |
| Abandonment | Attempts still In Progress past the deadline, or started and not submitted, divided by starts. | Attempt state. Weekly. | Above 40%: inspect time limits and task length before changing the pass rule. |
| Overturn after issue | Revoked or formally reversed certificates divided by certificates issued in the period. | Certificate status. Monthly. | Above 5%: halt issuance for that assessment version and review the rubric. |
| **Completion mistaken for competency** (trust failure) | Partner checks whose ID is a completion record, plus support notes that say a completion was offered as skill proof. Count, not a rate, until volume exists. | Verification events joined to completion IDs. Weekly. | More than 10 in a week: change employer instructions and the learner share text. Do not relabel those records as certificates. |

Hiring performance is not a metric here. It would need a later study. These numbers do not show that the product improves hiring.
