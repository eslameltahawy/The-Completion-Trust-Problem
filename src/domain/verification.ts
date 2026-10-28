import { verificationText } from "@/i18n/verification-text";
import type { Locale } from "@/i18n/locale";

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
      status: "Course Completion record";
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

export const INVALID_MESSAGE = verificationText("en").invalid;

export function toPublicVerification(
  certificate: CertificateSource | null,
  locale: Locale = "en",
): PublicVerification {
  const text = verificationText(locale);
  if (!certificate || (certificate.status !== "verified" && certificate.status !== "revoked")) {
    return { outcome: "invalid", message: text.invalid };
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
      message: text.revoked,
      ...shared,
      status: "Revoked",
    };
  }

  return {
    outcome: "verified",
    message: text.verified,
    ...shared,
    outcomeLabel: certificate.outcomeLabel,
    criteriaSummary: certificate.criteriaSummary,
    evidenceSummary: certificate.evidenceSummary,
    status: "Verified",
  };
}

export function toCompletionVerification(source: CompletionSource, locale: Locale = "en"): PublicVerification {
  const text = verificationText(locale);
  const label = source.legacyLabel ?? "Certificate of Completion";
  const historical = source.historical ? text.historical(label) : text.current;
  const revision =
    source.laterVersionLabels.length > 0
      ? text.revision(source.versionLabel, source.laterVersionLabels.join(", "))
      : text.onlyVersion(source.versionLabel);

  return {
    outcome: "completion_record",
    message: text.completion,
    recordId: source.publicId,
    learnerName: source.learnerName,
    courseTitle: source.courseTitle,
    versionLabel: source.versionLabel,
    completedAtIso: source.completedAtIso,
    status: "Course Completion record",
    historical: source.historical,
    interpretation: `${historical} ${revision}`,
  };
}

export function toAttemptStatusVerification(
  source: AttemptStatusSource,
  locale: Locale = "en",
): PublicVerification {
  const text = verificationText(locale);
  const pending = source.state === "pending_review" || source.state === "submitted" || source.state === "returned";
  const status = source.state === "not_issued"
    ? "Not Verified / Not Issued"
    : source.state === "returned"
      ? "Returned for further review"
      : pending
        ? "Pending Review"
        : "In Progress";
  const message = source.state === "not_issued" ? text.notIssued : pending ? text.pending : text.inProgress;

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
