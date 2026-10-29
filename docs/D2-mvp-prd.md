# D2 — MVP PRD

## Users and use cases

Learners need a completion record that does not pretend to be mastery, and a clear way to attempt a competency assessment. Reviewers need a queue, the answers, the rubric, the proposal, and a recorded decision. Employer partners need to verify a certificate ID with no account. Career 180 operators need historical completions to stay completions.

Demo authentication is local and labeled. It is not Career 180 production identity. Partners are not asked to sign in.

## Objectives and exclusions

The MVP must show the full critical journey: completion record, assessment, pending review, reviewer decision, certificate, and partner verification. It must block illegal transitions and a second certificate for the same attempt.

Excluded: course player, production single sign-on, real model calls, the camera, a video recording of the screen, certificate expiry, payment, and any claim about hiring outcomes.

## Functional requirements

- Show completed courses and proof 180 Certificates as separate lists.
- Open and print a Course Completion record that says it is not a proof 180 Certificate.
- Start an assessment only when the learner owns the completion and the assessment targets that course version.
- Require an acknowledgement of rules, attempt limit, time limit, privacy, and review.
- Before the assessment starts, require Google Chrome and a share of the entire screen. Store one still image every five minutes for the reviewer. Do not record video. Leave the camera off.
- Save answers, submit once, and move the attempt to Pending Review.
- Let a reviewer approve, reject, or return, with a reason of at least 12 characters.
- Issue a certificate only on approval. Reject leaves Not Verified / Not Issued.
- Let a partner submit an ID and see Verified, Revoked, a Course Completion record, Pending Review, Not Verified / Not Issued, or an unknown ID.
- Keep answers, integrity events, and reviewer notes out of the partner view.
- Import a legacy completion without creating a proof 180 Certificate.

## Screen sharing

The assessment stays unstarted until the learner is in Google Chrome and has shared the whole screen. The story of that path is [D4](D4-prototype-and-sample-data.md) and [D5-learner-certificate-flow.mmd](D5-learner-certificate-flow.mmd). This is the same idea as Hubstaff: the reviewer looks at occasional screenshots, not a long video of the session.

**Browser.** Accept the session only when `navigator.userAgentData.brands` includes the brand `Google Chrome`. Do not treat “has `getDisplayMedia`” as enough. Microsoft Edge and Firefox have that method too. If `userAgentData` is missing, stop and tell the learner to open Google Chrome. A browser that pretends to be Chrome can pass this check.

**Permission.** Call the Screen Capture API from a button click, on HTTPS:

`navigator.mediaDevices.getDisplayMedia()`

Chrome always shows its own picker. The page cannot turn sharing on by itself. Ask for the monitor and refuse audio:

```js
await navigator.mediaDevices.getDisplayMedia({
  video: { displaySurface: "monitor" },
  audio: false,
  monitorTypeSurfaces: "include",
  selfBrowserSurface: "exclude",
  systemAudio: "exclude",
});
```

Then read `videoTrack.getSettings().displaySurface`. Continue only when it is `"monitor"`. A window or a tab is not enough: stop that track and ask again. If the learner dismisses the picker, the attempt does not start.

**Stills, not video.** Do not use `MediaRecorder`. Do not call `getUserMedia`. The camera stays off. There is no video file.

When sharing starts, grab one JPEG. Grab another every five minutes until the learner submits or the share ends. Play the stream in a hidden `<video>`, draw the frame with `canvas.getContext("2d").drawImage(...)`, and store `canvas.toBlob(..., "image/jpeg")`. In Chrome, `new ImageCapture(videoTrack).grabFrame()` grabs the same kind of frame. Terms to look up: Screen Capture API, `MediaDevices.getDisplayMedia`, `displaySurface`, `HTMLCanvasElement.toBlob`.

The reviewer sees those images in time order, each with its timestamp. There is no video player. One image is a review indicator, not a reason to reject by itself. If the learner stops the share from Chrome’s bar, pause the attempt until the monitor is shared again. Employer partners never receive the images.

The hosted demo does not call `getDisplayMedia` yet. It can still record that the assessment tab was hidden. That event is not a screenshot.

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
