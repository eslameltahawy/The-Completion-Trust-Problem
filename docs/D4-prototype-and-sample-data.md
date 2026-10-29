# D4 — Prototype and Sample Data

The hosted demo is https://the-completion-trust-problem.vercel.app. The intended learner journey is [D5-learner-certificate-flow.mmd](D5-learner-certificate-flow.mmd). Password for every sample account: `demo-pass`. People and organizations are fictional. There is no demo recording.

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env` if needed.

## A. Product purpose and scope

Completing a course confirms that a learner finished a course version. It does not show that they can do the skill. A Course Completion record is that confirmation. A proof 180 Certificate exists only after an assessment of that course's competency and a reviewer's approval. The two records stay separate. A completion record is never upgraded into a certificate.

This prototype shows that split: separate lists, a seeded assessment, a proposal from `demo_evaluator_v1`, human review, and public ID lookup. It does not call a model to write questions or to grade. Typing a Course Completion record ID to start, and generating questions from the course, are specified below and are not built. Camera monitoring, screenshots, and screen recording are not built. New review writes on the hosted demo can disappear when a server instance is replaced.

## B. Actors and permissions

**Learner.** Signs in. Sees only their completions, attempts, and certificates. Can open a Course Completion record, start an eligible seeded assessment, save answers, and submit. Cannot approve a certificate. Does not see another learner's queue.

**Reviewer.** Signs in as a reviewer. Sees the queue, answers, rubric, proposal, and any integrity events on the attempt. Can approve, reject, or return with a written reason. Does not see a video or screenshots, because none are stored.

**Employer partner.** No account. Enters an ID on `/portal/partner`. A matched record shows the learner's name, the course, the version, and the public status. A verified proof 180 Certificate also shows the competency, criteria, and a short evidence summary. The partner does not see answers, integrity events, or the revocation note. An unknown ID returns Not Verified and no personal information. A Course Completion record is not shown as a proof 180 Certificate.

## C. User stories and acceptance criteria

### US-L1 — Completed courses

As a learner, I want to see my completed courses and their Course Completion records, so that I can tell completion from a certificate.

Preconditions: the learner is signed in.

Main flow: open `/portal/student`. Completions are in one list. Certificates are in another.

Acceptance: Given Amira, when she opens the dashboard, then she sees Course Completion records and, separately, `CTC-4F8C1A9B2E`. Given Rania, when she opens it, then both lists are empty.

Edge: a completion never appears in the certificate list by itself.

Status: Implemented in prototype.

### US-L2 — Start from a completion ID

As a learner, I want to enter a Course Completion record ID, so that the assessment is tied to that completion.

Preconditions: the learner is signed in and has a completion.

Main flow, intended: the learner types the public ID, such as `CCR-HANA-DATA01`. The backend checks the ID, ownership, and eligibility, then loads that record.

Acceptance, intended: Given a valid owned ID, when it is submitted, then the matching course is loaded. Given an unknown ID, when it is submitted, then the journey stops. Given another learner's ID, when it is submitted, then the journey stops.

Edge: the prototype has no ID field. The button on the course card opens `/portal/student/courses/{internal id}/assessment` for a completion the signed-in learner already owns. A stranger's completion returns not found.

Status: Planned/not implemented as a typed public ID. Ownership is implemented on the dashboard route.

### US-L3 — Course details before the start

As a learner, I want to see the course retrieved for this completion, so that I know which skill the assessment is about.

Preconditions: an eligible completion is open.

Main flow, intended: after the ID is accepted, show course ID and title, version, objectives, competency, relevant materials, specialization, and attempt history. The prototype shows title, version, objectives, competency, criteria, duration, and attempt limit on the intro page. It does not show a materials library or a specialization configuration screen.

Acceptance: Given Hana's Data Literacy card, when she opens the assessment intro, then the page names that course and its competency. Given a completion she does not own, when the URL is opened, then the page is not found.

Edge: missing course data in the intended flow stops generation. The prototype simply has no start button when no assessment definition exists.

Status: Partially implemented.

### US-L4 — Eligibility

As a learner, I want to know whether this completion can be assessed, so that I do not expect a certificate from the wrong course.

Preconditions: the learner is signed in.

Main flow: the dashboard and the intro explain Assessment Design Required, Not Yet Eligible, attempts exhausted, in progress, pending, returned, verified, or revoked.

Acceptance: Given Workplace Communication, when the learner looks for a start action, then the state is Assessment Design Required and no attempt starts. Given Layla's Excel v1 record `CCR-LAYLA-EXCL1`, when a v2 quiz is requested, then the state is Not Yet Eligible and the record stays on v1. Given Yusuf's data completion, when attempts are used up, then no further start is offered.

Edge: an issued certificate does not start another attempt for that completion.

Status: Implemented in prototype.

### US-L5 — Assessment for this course

As a learner, I want an assessment written for this course and its competency criteria, so that the questions match what I finished.

Preconditions: the completion is eligible.

Main flow, intended: the assessment service sends the course, objectives, criteria, specialization, difficulty, and policy to an AI generation service. The questions must come from that material. The system checks them, then saves the assessment version. If generation fails, or the course data is not enough, the journey stops. It does not insert unrelated questions.

Acceptance, intended: Given enough course data, when generation succeeds, then every question is stored against that course version and competency. Given a failure, when the learner continues, then no assessment is shown.

The prototype does not call a model. It shows the seeded assessment already attached to that course version. Data Literacy is four keyed questions. Excel v2 is two. Those counts are sample data, not the five-to-seven assumption in section E.

Status: Planned/not implemented for live generation. A course-specific seeded assessment is implemented.

### US-L6 — Instructions and attempt policy

As a learner, I want the instructions, duration, question count, and attempt policy before I start, so that I know the rules.

Preconditions: an assessment is available.

Main flow: the intro shows the rules, the duration from the assessment definition, and the attempt limit. The intended policy is one first attempt and one further attempt. Five questions is the default, and seven is the upper count where a specialization needs it. Both numbers are unvalidated assumptions. Duration and format follow the specialization. Reaching the limit does not issue a certificate.

Acceptance: Given Hana's quiz, when the intro opens, then it shows 20 minutes and a limit of 2. Given Yusuf after two unsuccessful attempts, when he returns, then he cannot start a third, and no certificate exists.

Edge: the prototype does not display a fixed count of five. The seeded definition's own duration and question list are what the learner sees. The acknowledgement checkbox is required. The integrity checkbox is optional.

Status: Partially implemented. The 5-and-7 rule is Planned/not implemented.

### US-L7 — Answer and submit

As a learner, I want to answer and submit, so that my attempt can be reviewed.

Preconditions: the attempt is In Progress and the learner owns it.

Main flow: open `/portal/student/attempts/{id}`. Answers save while the attempt is open. Submit once. The server records the submission and moves the attempt to Pending Review. The timer expiry submits saved answers once.

Acceptance: Given Hana's Data Literacy quiz, when she submits, then the state is Pending Review and no proof 180 Certificate appears. Sample key, for the demo only: B, B, B, A. Given a second submit, when the attempt is no longer In Progress, then no second evaluation is created.

Edge: another learner cannot save answers on this attempt.

Status: Implemented in prototype.

### US-L8 — Submission status

As a learner, I want to see whether my submission is pending, approved, rejected, or returned, so that I know what happens next.

Preconditions: an attempt exists.

Main flow: the dashboard pill and the attempt page show the state. Approved is shown as Verified, with a certificate link. Rejected is Not Verified / Not Issued. Returned stays with the reviewer. The learner can open the attempt but cannot decide it.

Acceptance: Given `att-omar-sql`, when Omar opens his dashboard, then the state is Pending Review. Given `att-yusuf-2`, when Yusuf opens his, then the state is Not Verified / Not Issued. Given `att-omar-agile`, when Omar opens it, then the state is Returned for further review.

Edge: a returned attempt is not a new quiz for the learner. The reviewer decides it later.

Status: Implemented in prototype.

### US-L9 — Certificate only after issuance

As a learner, I want to open a competency certificate only after it has been issued, so that a score is not mistaken for a credential.

Preconditions: a reviewer has approved, or a certificate already exists in the sample data.

Main flow: `/portal/student/certificates/{publicId}` opens only for that learner's certificate. The page states that the certificate does not promise employment or later job performance.

Acceptance: Given a submitted quiz and no approval, when the learner looks for a certificate, then none exists. Given Amira and `CTC-4F8C1A9B2E`, when she opens it, then the proof 180 Certificate is shown. Given a revoked certificate, when she opens it, then the status is Revoked.

Edge: a Course Completion record page says it is not a proof 180 Certificate. Partners cannot use that ID as competency.

Status: Implemented in prototype.

### US-L10 — No assessment design

As a learner, I want a clear stop when the course has no suitable assessment, so that completion is not turned into a certificate.

Preconditions: the course version has no assessment definition.

Main flow: the state is Assessment Design Required. No questions are invented and no certificate is issued.

Acceptance: Given `CCR-AMIRA-COMM1`, `CCR-HANA-COMM01`, or `CCR-YUSUF-COMM1`, when the learner looks for a certificate action, then no attempt starts.

Edge: the Course Completion record remains available.

Status: Implemented in prototype.

### US-R11 — Review queue

As a reviewer, I want the queue and the submission, so that I can review the right attempt.

Preconditions: the reviewer is signed in.

Main flow: `/portal/reviewer` lists attempts. Filters include pending and returned. Open `/portal/reviewer/attempts/{id}`.

Acceptance: Given Nadia, when she opens the queue, then Omar's SQL attempt and Sara's practical are available. Given a learner, when they open the reviewer route, then the server refuses.

Edge: corporate enrollment is shown as context. It is not a competency score.

Status: Implemented in prototype.

### US-R12 — Evidence for the decision

As a reviewer, I want the rubric, answers, supporting evidence, and proposed evaluation, so that I can judge the attempt.

Preconditions: the attempt has been submitted, or it is returned.

Main flow: the attempt page shows questions, answers, criteria, the `demo_evaluator_v1` proposal, and integrity events if any exist.

Acceptance: Given a submitted quiz, when Nadia opens it, then she sees the proposal and the answers. The proposal is labeled as a proposal. Given `att-omar-agile`, when she opens it, then the seeded tab-hidden signal is visible.

Edge: the signal is not proof of cheating. Copy and paste are not recorded. No camera image, screenshot, or screen recording is stored. A not-yet-submitted attempt has no proposal.

Status: Implemented in prototype for the seeded package. Screenshot review is Planned/not implemented.

### US-R13 — Decision with a reason

As a reviewer, I want to approve, reject, or return with a reason, so that the outcome is explained.

Preconditions: the attempt is Pending Review, or Returned for further review. Return is offered only from Pending Review.

Main flow: Nadia writes a reason of at least 12 characters and chooses approve, reject, or return.

Acceptance: Given approval, when the decision is saved, then one proof 180 Certificate is created and a second approval fails. Given rejection, when it is saved, then no certificate exists. Given return, when it is saved, then the attempt stays in the queue for a later approve or reject.

Edge: a reason shorter than 12 characters is refused. Changing the proposed result is stored as a material change.

Status: Implemented in prototype.

### US-R14 — Audit

As a reviewer, I want the decision recorded, so that issuance can be traced.

Preconditions: a decision was saved.

Main flow: the decision stores the reviewer, the outcome, the reason, and whether the proposal was changed. Issuance writes the certificate against that attempt. The public ID is unique.

Acceptance: Given a new approval, when the certificate is opened, then its ID is new and is not one of the seeded IDs. Given the historical import running twice, when counts are compared, then it does not create a proof 180 Certificate.

Edge: on the hosted demo, a new decision can disappear when the temporary database is replaced. Seeded rows remain.

Status: Implemented in prototype, with that hosting limit.

### US-P15 — Verify without an account

As an employer partner, I want to check a proof 180 Certificate by its ID, so that I do not need an account.

Preconditions: none.

Main flow: open `/portal/partner` and submit the ID.

Acceptance: Given `CTC-4F8C1A9B2E`, when it is submitted, then the result is Verified and includes name, course, competency, date, criteria, and a short evidence summary.

Edge: refreshing the result writes another verification event.

Status: Implemented in prototype.

### US-P16 — Certificate versus completion

As an employer partner, I want a competency certificate distinguished from a Course Completion record, so that I do not treat completion as mastery.

Preconditions: none.

Main flow: the result names the document type.

Acceptance: Given `CCR-LAYLA-EXCL1`, when it is submitted, then the result is a Course Completion record for Excel v1, names Layla Farouk, and does not present competency. Given `CTC-77B3E2D1C8`, when it is submitted, then the result is Revoked and the internal reason is absent. Given `CTC-91D0E7C4A6`, when it is submitted, then Sara Ibrahim's certificate is Verified.

Edge: a completion ID is not labeled Verified.

Status: Implemented in prototype.

### US-P17 — Pending, rejected, and unknown IDs

As an employer partner, I want a clear response for pending, rejected, and unknown IDs, so that I do not infer a credential that was not issued.

Preconditions: none.

Main flow: the lookup returns the public status only.

Acceptance: Given `att-omar-sql` or `att-sara-disc`, when submitted, then the result is Pending Review and not a proof 180 Certificate. Given `att-yusuf-2` or `att-noor-sql`, when submitted, then the result is Not Verified / Not Issued. Given `CTC-DOES-NOT-EXIST` or an ID with illegal characters, when submitted, then the result is Not Verified and includes no personal information.

Edge: a matched pending or completion record does include the learner's name and course. It does not include answers, integrity events, or reviewer notes.

Status: Implemented in prototype.

## D. Assessment lifecycle and state transitions

Attempt states in the application are In Progress, Submitted, Pending Review, Returned for further review, Verified, and Not Verified / Not Issued. Certificates are Verified or Revoked. Courses may also be Assessment Not Started, Assessment Design Required, or Not Yet Eligible. Those course states are eligibility results, not attempt rows.

Allowed moves: In Progress to Submitted; Submitted to Pending Review; Pending Review to Verified, Not Verified / Not Issued, or Returned; Returned to Verified or Not Verified / Not Issued. A Verified certificate may be Revoked. Other moves are rejected.

Submit does the first two moves together. They are automatic. Approval, rejection, return, and revocation require a person. A passing proposal does not move the attempt to Verified. Exhausting two attempts does not issue a certificate. The two-attempt policy and any numeric pass line are hypotheses.

The diagram in [D5-certificate-lifecycle.mmd](D5-certificate-lifecycle.mmd) matches these moves. There is no separate Approved state. Verified means the certificate was issued.

## E. AI assessment-generation specification

This section is the intended contract. It is not what the prototype runs. `demo_evaluator_v1` is a deterministic local function. It proposes a result after submit. It does not generate questions and it does not call a model.

**Inputs.** Course Completion record ID. Course ID, title, and the version the learner finished. Learning objectives and competency criteria. Relevant course content where it exists. Specialization and assessment-design configuration. Difficulty and policy, including the attempt rule. Prior attempt history.

**Processing.** Validate the ID, ownership, and eligibility. Retrieve the course data. If the design is missing, stop at Assessment Design Required. If the data is not sufficient, stop. Build a generation request grounded in that course and those criteria. The AI service returns questions for that competency only. Validate count, format, and alignment. Persist the assessment ID, course version, criteria, questions, formats, duration, attempt policy, and generation metadata.

**Outputs.** Assessment ID, course and version reference, competency criteria, questions, formats, duration, attempt policy, and generation metadata.

**Policy assumptions, not findings.** Default length is five questions. A specialization may use up to seven. Duration and format depend on the specialization. The attempt policy is one first attempt and one further attempt. None of these have been validated with learners or employers.

**Failure handling.** Invalid ID: stop. Another learner's record: stop. Insufficient course information: stop, and do not substitute unrelated questions. No suitable design: Assessment Design Required, and do not issue a certificate. Provider failure or questions that fail validation: stop, and do not show a fallback quiz. Exhausted attempts: stop, and do not issue a certificate. An attempt that is already pending, returned, or issued: show that status instead of generating another assessment.

The prototype skips this contract. Questions, durations, and the two-attempt limit are rows in `prisma/seed.ts`.

## F. Sample data and scenario coverage

The 27 lookup IDs are in [../data/sample-records.json](../data/sample-records.json). Inventory: [../data/sample-data-inventory.md](../data/sample-data-inventory.md).

| Scenario | ID | Account |
| --- | --- | --- |
| Issued proof 180 Certificate | `CTC-4F8C1A9B2E` | `amira.hassan@demo.local` |
| Second issued certificate, corporate learner | `CTC-91D0E7C4A6` | `sara.ibrahim@demo.local` |
| Pending review, corporate learner | `att-omar-sql` | `omar.nasser@demo.local` |
| Second item pending review | `att-sara-disc` | `sara.ibrahim@demo.local` |
| Eligible quiz not started | `CCR-HANA-DATA01` | `hana.mostafa@demo.local` |
| Also not started | `CCR-LAYLA-DATA1`, `CCR-AMIRA-EXCL2` | Layla Farouk, Amira Hassan |
| Failed first attempt | `att-yusuf-1` | `yusuf.adel@demo.local` |
| Second failure, attempts exhausted | `att-yusuf-2` | `yusuf.adel@demo.local` |
| Not issued, one retry remains | `att-noor-sql` | `noor.fahmy@demo.local` |
| No completed courses | none | `rania.saleh@demo.local` |
| Historical completion, not competency | `CCR-LAYLA-EXCL1` | `layla.farouk@demo.local` |
| Revoked certificate | `CTC-77B3E2D1C8` | `noor.fahmy@demo.local` |
| Unknown ID | `CTC-DOES-NOT-EXIST` | no person |
| No assessment design | `CCR-AMIRA-COMM1`, `CCR-HANA-COMM01`, `CCR-YUSUF-COMM1` | Amira, Hana, Yusuf |
| In progress, sample extended time | `att-karim-disc` | `karim.soliman@demo.local` |
| Returned after a seeded integrity signal | `att-omar-agile` | `omar.nasser@demo.local` |
| Completion beside an issued certificate | `CCR-AMIRA-DATA1`, `CCR-SARA-DATA01` | Amira, Sara |

`CCR-OMAR-SQL001`, `CCR-SARA-DISC01`, `CCR-KARIM-DISC1`, `CCR-YUSUF-DATA1`, `CCR-NOOR-SQL001`, `CCR-OMAR-AGILE1`, and `CCR-NOOR-AGILE1` are the completion records behind the attempts and certificates above. Looking any of them up shows a Course Completion record, not a proof 180 Certificate.

## G. Prototype walkthrough

What follows is the built prototype. It is not the AI-generation flow in section E.

**Learner.** Sign in as `hana.mostafa@demo.local` at `/portal/login`. On `/portal/student`, Data Literacy is Assessment Not Started. Choose **Get proof 180 Certificate**. Read the rules, acknowledge them, and start. The questions are the seeded quiz, not a model response. Submit. The state becomes Pending Review and no certificate appears. Workplace Communication stays Assessment Design Required.

Sign in as Amira to see completion records separated from `CTC-4F8C1A9B2E`. Open `/portal/student/completions/{id}` for a completion and read that it is not a proof 180 Certificate.

**Reviewer.** Sign in as `nadia.karim@demo.local`. Open Omar's SQL attempt or Sara's practical from `/portal/reviewer`. Read the answers and the proposal. Approve, reject, or return with a reason. Approval creates a new public ID. Sign in as that learner, open `/portal/student/certificates/{publicId}`, and copy the ID. Do not expect the seeded IDs to change.

**Partner.** No login. On `/portal/partner`, check `CTC-4F8C1A9B2E`, then `CCR-LAYLA-EXCL1`, then `att-omar-sql`, then `CTC-DOES-NOT-EXIST`.

**Edges.** Yusuf cannot start again. Layla's Excel v1 record stays on v1. Noor's revoked ID does not show the internal reason. Karim's practical is still In Progress. Omar's agile attempt is Returned and includes a seeded tab-hidden note, not a capture from a live session.

## H. Known limitations and next steps

Live AI assessment generation is not implemented. Assessments are not created at runtime, and generation metadata is not stored. The typed completion-ID entry point is not implemented. The five-question default, the seven-question ceiling, the two-attempt rule, and numeric pass marks are unvalidated assumptions. `demo_evaluator_v1` matches keys and expected phrases. It is not a fair grader of new wording.

There is no production identity provider. The demo password is local. There is no camera, no screenshot capture, and no screen recording. The only live integrity signal is an optional tab-hidden event, and only when the learner consents. Copy and paste are not recorded. Certificate expiry is not modeled. The hosted demo's new review decisions are ephemeral. No user research and no recording exist.
