export interface CertificateSource {
  status: string;
  publicId: string;
  learnerName: string;
  courseTitle: string;
  versionLabel: string;
  competencyName: string;
  assessmentMethod: string;
  assessmentDateIso: string;
  outcomeLabel: string;
  criteriaSummary: string;
  evidenceSummary: string;
}

export interface CompletionSource {
  publicId: string;
  learnerName: string;
  courseTitle: string;
  versionLabel: string;
  completedAtIso: string;
  historical: boolean;
  legacyLabel: string | null;
  laterVersionLabels: string[];
}

export interface AttemptStatusSource {
  publicId: string;
  learnerName: string;
  courseTitle: string;
  versionLabel: string;
  competencyName: string;
  assessmentMethod: string;
  state: string;
  activityDateIso: string;
}

type SharedRecord = {
  recordId: string;
  learnerName: string;
  courseTitle: string;
  versionLabel: string;
};

export type PublicVerification =
  | { outcome: "invalid"; message: string }
  | (SharedRecord & {
      outcome: "completion_record";
      message: string;
      completedAtIso: string;
      status: "Course Completion Record";
      historical: boolean;
      interpretation: string;
    })
  | (SharedRecord & {
      outcome: "assessment_status";
      message: string;
      competencyName: string;
      assessmentMethod: string;
      activityDateIso: string;
      status: string;
    })
  | (SharedRecord & {
      outcome: "verified";
      message: string;
      certificateId: string;
      competencyName: string;
      assessmentMethod: string;
      assessmentDateIso: string;
      outcomeLabel: string;
      criteriaSummary: string;
      evidenceSummary: string;
      status: "Verified";
    })
  | (SharedRecord & {
      outcome: "revoked";
      message: string;
      certificateId: string;
      competencyName: string;
      assessmentMethod: string;
      assessmentDateIso: string;
      status: "Revoked";
    });

export const INVALID_MESSAGE =
  "Not Verified. This identifier does not match a Course Completion Record or a Competency Certificate. No personal information is available for an unknown ID.";

export function toPublicVerification(certificate: CertificateSource | null): PublicVerification {
  if (!certificate || (certificate.status !== "verified" && certificate.status !== "revoked")) {
    return { outcome: "invalid", message: INVALID_MESSAGE };
  }

  const shared = {
    recordId: certificate.publicId,
    certificateId: certificate.publicId,
    learnerName: certificate.learnerName,
    courseTitle: certificate.courseTitle,
    versionLabel: certificate.versionLabel,
    competencyName: certificate.competencyName,
    assessmentMethod: certificate.assessmentMethod,
    assessmentDateIso: certificate.assessmentDateIso,
  };

  if (certificate.status === "revoked") {
    return {
      outcome: "revoked",
      message:
        "Revoked. This Competency Certificate is no longer valid evidence of competency. It is not a Course Completion Record.",
      ...shared,
      status: "Revoked",
    };
  }

  return {
    outcome: "verified",
    message:
      "Verified. This is a Competency Certificate issued after assessment and human review. It is not a Course Completion Record, and it does not guarantee employment or future job performance.",
    ...shared,
    outcomeLabel: certificate.outcomeLabel,
    criteriaSummary: certificate.criteriaSummary,
    evidenceSummary: certificate.evidenceSummary,
    status: "Verified",
  };
}

export function toCompletionVerification(source: CompletionSource): PublicVerification {
  const historical = source.historical
    ? `Historical Certificate. The original label was "${source.legacyLabel ?? "Certificate of Completion"}". It is preserved under the completion standard in effect on the issue date and was not upgraded.`
    : "This is a current Course Completion Record, not a historical import.";
  const revision =
    source.laterVersionLabels.length > 0
      ? `This record applies only to ${source.versionLabel}. The course now also has ${source.laterVersionLabels.join(", ")}. Finishing the earlier version does not prove the later objectives.`
      : `This record applies to ${source.versionLabel} only.`;

  return {
    outcome: "completion_record",
    message:
      "Course Completion Record. This confirms that the learner finished this course version. It is not a Competency Certificate and is not evidence of demonstrated competency.",
    recordId: source.publicId,
    learnerName: source.learnerName,
    courseTitle: source.courseTitle,
    versionLabel: source.versionLabel,
    completedAtIso: source.completedAtIso,
    status: "Course Completion Record",
    historical: source.historical,
    interpretation: `${historical} ${revision}`,
  };
}

export function toAttemptStatusVerification(source: AttemptStatusSource): PublicVerification {
  const pending = source.state === "pending_review" || source.state === "submitted" || source.state === "returned";
  const status = source.state === "not_issued"
    ? "Not Verified / Not Issued"
    : source.state === "returned"
      ? "Returned for further review"
      : pending
        ? "Pending Review"
        : "In Progress";
  const message = source.state === "not_issued"
    ? "Not Verified / Not Issued. This assessment did not produce a Competency Certificate. It is not a verified credential."
    : pending
      ? "Pending Review. A Competency Certificate has not been issued. This ID is not evidence of competency."
      : "This assessment is still in progress. No Competency Certificate has been issued.";

  return {
    outcome: "assessment_status",
    message,
    recordId: source.publicId,
    learnerName: source.learnerName,
    courseTitle: source.courseTitle,
    versionLabel: source.versionLabel,
    competencyName: source.competencyName,
    assessmentMethod: source.assessmentMethod,
    activityDateIso: source.activityDateIso,
    status,
  };
}

export function normalizeCertificateQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 40) return null;
  if (!/^[A-Za-z0-9-]+$/.test(trimmed)) return null;
  return trimmed.toUpperCase();
}
