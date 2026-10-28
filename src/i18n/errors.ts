import { isDomainError } from "@/domain/errors";
import type { Locale } from "./locale";

const arByCode: Record<string, string> = {
  invalid_login: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  forbidden: "هذا السجل غير متاح لهذا الحساب.",
  acknowledgement_required: "اقرأ القواعد وأكدها قبل بدء التقييم.",
  design_required:
    "تصميم التقييم مطلوب. لهذه الدورة Course Completion record فقط. لا يوجد تقييم كفاءة معتمد بعد، لذلك لا يمكن إصدار proof 180 Certificate.",
  not_yet_eligible:
    "غير مؤهل بعد. هذا الإتمام لنسخة لا تتضمن هذا التقييم. إنهاء النسخة الأقدم لا يؤهل المتعلّم لتقييم النسخة الأحدث، والسجل التاريخي يبقى كما هو.",
  not_eligible: "هذه الدورة غير مفتوحة لتقييم كفاءة جديد.",
  attempts_exhausted: "تم بلوغ حد المحاولات لهذا التقييم.",
  invalid_answer: "هذه الإجابة غير مقبولة أو أطول من الحد.",
  invalid_transition: "لا يمكن تنفيذ هذا الانتقال من الحالة الحالية.",
  invalid_reason: "اكتب سببًا من 12 حرفًا على الأقل.",
  invalid_decision: "اختر الموافقة أو الرفض أو الإعادة.",
  not_found: "لم يُعثر على التقييم أو على proof 180 Certificate.",
};

export function publicError(locale: Locale, error: unknown, fallback: string) {
  if (!isDomainError(error)) return locale === "ar" ? "تعذّر إكمال الطلب. حاول مرة أخرى." : fallback;
  if (locale === "ar" && arByCode[error.code]) return arByCode[error.code];
  return error.message;
}
