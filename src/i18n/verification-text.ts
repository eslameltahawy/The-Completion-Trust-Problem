import type { Locale } from "./locale";

export function verificationText(locale: Locale = "en") {
  if (locale === "ar") {
    return {
      invalid:
        "غير موثّق. هذا المعرّف لا يطابق Course Completion record ولا proof 180 Certificate. لا تتاح أي بيانات شخصية لمعرّف غير معروف.",
      revoked:
        "مُلغاة. لم تعد proof 180 Certificate دليلًا ساريًا على الكفاءة. وهي ليست Course Completion record.",
      verified:
        "موثّق. هذه proof 180 Certificate صدرت بعد تقييم ومراجعة بشرية. وهي ليست Course Completion record، ولا تضمن التوظيف أو الأداء الوظيفي لاحقًا.",
      completion:
        "Course Completion record. يؤكد أن المتعلّم أنهى هذه النسخة من الدورة. وهو ليس proof 180 Certificate، وليس دليلًا على إتقان المهارة.",
      current: "هذا Course Completion record حالي، وليس استيرادًا تاريخيًا.",
      notIssued:
        "غير موثّق / لم تُصدر. لم ينتج هذا التقييم proof 180 Certificate. وهو ليس وثيقة موثّقة.",
      pending: "قيد المراجعة. لم تُصدر proof 180 Certificate. هذا المعرّف ليس دليلًا على الكفاءة.",
      inProgress: "هذا التقييم ما زال قيد التنفيذ. لم تُصدر proof 180 Certificate.",
      historical(label: string) {
        return `شهادة تاريخية. كانت التسمية الأصلية «${label}». حُفظت وفق معيار الإتمام الساري في تاريخ الإصدار، ولم تُرقَّ.`;
      },
      revision(version: string, later: string) {
        return `ينطبق هذا السجل على ${version} فقط. للدورة الآن أيضًا ${later}. إنهاء النسخة الأقدم لا يثبت أهداف النسخة الأحدث.`;
      },
      onlyVersion(version: string) {
        return `ينطبق هذا السجل على ${version} فقط.`;
      },
    };
  }
  return {
    invalid:
      "Not Verified. This identifier does not match a Course Completion record or a proof 180 Certificate. No personal information is available for an unknown ID.",
    revoked:
      "Revoked. This proof 180 Certificate is no longer valid evidence of competency. It is not a Course Completion record.",
    verified:
      "Verified. This is a proof 180 Certificate issued after assessment and human review. It is not a Course Completion record, and it does not guarantee employment or future job performance.",
    completion:
      "Course Completion record. This confirms that the learner finished this course version. It is not a proof 180 Certificate and is not evidence of demonstrated competency.",
    current: "This is a current Course Completion record, not a historical import.",
    notIssued:
      "Not Verified / Not Issued. This assessment did not produce a proof 180 Certificate. It is not a verified credential.",
    pending: "Pending Review. A proof 180 Certificate has not been issued. This ID is not evidence of competency.",
    inProgress: "This assessment is still in progress. No proof 180 Certificate has been issued.",
    historical(label: string) {
      return `Historical Certificate. The original label was "${label}". It is preserved under the completion standard in effect on the issue date and was not upgraded.`;
    },
    revision(version: string, later: string) {
      return `This record applies only to ${version}. The course now also has ${later}. Finishing the earlier version does not prove the later objectives.`;
    },
    onlyVersion(version: string) {
      return `This record applies to ${version} only.`;
    },
  };
}
