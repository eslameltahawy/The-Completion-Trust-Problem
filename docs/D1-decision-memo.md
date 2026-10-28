# D1 — Decision Memo

Labels used below: **Brief-backed**, **Product decision**, **Assumption / hypothesis**. None of the assumptions have been validated with learners or employers.

## Problem

**Brief-backed.** Completing a course does not demonstrate mastery of the skill. A completion credential can confirm that a learner finished the course. An employer cannot reliably infer competency from that fact alone. The trust gap sits between learners, Career 180, and employer partners.

The product should not ask employers to trust every certificate in the same way. It should make course completion and demonstrated competency easy to tell apart.

## Recommended trust model

**Product decision.** The product separates two outcomes.

A **Course Completion record** is issued for an eligible completion. It confirms completion of a named course version. It is not a proof 180 Certificate and must not be read as one.

A **proof 180 Certificate** is possible only after a Competency Assessment, an evidence package, and human review. In this MVP every certificate requires reviewer approval. The demo evaluator may propose pass or fail. That proposal never issues a certificate, even when a numeric score is above a configured line.

**Product decision.** The certificate names the competency, the criteria, the outcome, and a public ID. It does not claim employability, professional success, or future job performance.

Employer partners verify an ID without an account. A proof 180 Certificate can be Verified or Revoked. A Course Completion record is shown as completion only, including when it is a Historical Certificate or belongs to an older course version. A pending or unapproved assessment is shown as not issued. An unknown ID returns Not Verified and no personal information.

## Courses without an assessment

**Product decision.** If a course version has no assessment, the state is **Assessment Design Required**. The system does not invent questions or award competency. Workplace Communication is the sample.

If the learner completed an older version and the assessment exists only on a later version, the state is **Not Yet Eligible**. Excel for Operations version 1 is the sample. The historical record stays on version 1.

## Historical certificates

**Product decision.** Older completion documents remain completion records. They are not upgraded. The original date, label, and course version are kept. Migration is idempotent: a second run does not create another record or any proof 180 Certificate, and it writes an audit row. The demonstration uses fictional sample data only.

**Assumption / hypothesis.** Production history will be incomplete. Where the course version cannot be recovered, the record should stay a completion and say that the version is unknown, rather than guessing a competency.

## Corporate learners

**Product decision.** Corporate enrollment is context, not a trust penalty. Comparable assessments use the same rubric for corporate and self-directed learners. The reviewer can see the employer name. The partner verification result does not treat that affiliation as a competency score.

## Stakeholder conflict and cost

Three incentives compete. **Brief-backed.** Content and instructors are paid and measured on low-friction completion. Employer partnerships need evidence they can defend. Growth and marketing need a number that still means something.

**Product decision.** Course completion stays the existing completion event. It is not redefined. Instructor payouts stay tied to completion, not to proof 180 Certificates. Competency is an optional second process. Growth must not report certificates issued as if they were courses completed.

**Assumption / hypothesis, not Career 180 financial data.** A first pilot of about 200 submitted assessments a month, at 15 minutes of review each, is about 50 reviewer hours a month. At an assumed fully loaded rate of $30 an hour, that is about $1,500 a month. The product and operations budget bears that cost. Content does not fund it through a lower completion payout. If volume is twice as high, the hours and the cost double. If reviewers cannot keep the median decision inside five business days, the response is to narrow which courses offer assessment, not to auto-issue certificates.

**Product decision.** The MVP chooses fewer, slower certificates over automatic issuance. A two-attempt limit and any numeric pass mark are hypotheses, not calibrated policy. A reviewer may override a proposal only with a written reason. One integrity signal cannot reject a learner by itself. Revocation exists for a disputed certificate, and the public view does not include the investigation note.

The cost of this choice is review capacity. The benefit is that "Verified" means a person approved an evidence package, not that a course ended or a score crossed a line.

## MVP scope for one quarter

A small team can ship the critical path: completion records, configurable assessments, saved attempts, demo evaluation, a review queue, issuance rules, historical import of sample records, and public verification. Real AI grading, camera or screen capture, production identity, and hiring-outcome claims are out of scope. Courses still finish in the existing learning system. This prototype does not include a course player.

## Assumptions and evidence

| Claim | Label |
| --- | --- |
| Completion is not mastery | Brief-backed |
| Employers need a visible distinction more than a new logo | Brief-backed |
| Human review before every certificate is the right MVP rule | Product decision |
| Two attempts and a 75% quiz line are acceptable | Assumption / hypothesis |
| Employers will look up IDs and understand Not Verified | Assumption / hypothesis |
| A short rubric is useful evidence for these sample skills | Assumption / hypothesis |
| Review can keep up with volume | Assumption / hypothesis |

No interviews or outcome studies were run for this submission. Those tests are specified in D3. Until they exist, the product must not claim that it improves hiring.
