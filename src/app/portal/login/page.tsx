import { loginFromForm } from "@/app/actions/auth";
import { LoginForm } from "@/components/LoginForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";

const accounts = [
  ["Amira Hassan", "amira.hassan@demo.local", "en-amira", "ar-amira"],
  ["Omar Nasser", "omar.nasser@demo.local", "en-omar", "ar-omar"],
  ["Yusuf Adel", "yusuf.adel@demo.local", "en-yusuf", "ar-yusuf"],
  ["Hana Mostafa", "hana.mostafa@demo.local", "en-hana", "ar-hana"],
  ["Rania Saleh", "rania.saleh@demo.local", "en-rania", "ar-rania"],
  ["Nadia Karim", "nadia.karim@demo.local", "en-nadia", "ar-nadia"],
] as const;

const notes = {
  en: {
    "en-amira": "Issued proof 180 Certificate and a Course Completion record",
    "en-omar": "Corporate learner with a review queue item",
    "en-yusuf": "Failed attempts and an exhausted limit",
    "en-hana": "Eligible quiz that has not been started",
    "en-rania": "No completed courses",
    "en-nadia": "Reviewer",
  },
  ar: {
    "ar-amira": "لديها proof 180 Certificate وCourse Completion record",
    "ar-omar": "متعلّم ضمن شركة، وتقييمه قيد المراجعة",
    "ar-yusuf": "محاولات غير ناجحة، وقد استُنفد الحد",
    "ar-hana": "اختبار مؤهل ولم يبدأ بعد",
    "ar-rania": "لا توجد دورات مكتملة",
    "ar-nadia": "مراجعة",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocale();
  const t = copy(locale);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <section className="card p-6">
        <h1 className="serif text-4xl">{t.signInTitle}</h1>
        <p className="mt-3 text-muted">{t.signInLead}</p>
        {error ? (
          <p className="mt-4 text-red" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
      <section>
        <h2 className="serif text-2xl">{t.sampleAccounts}</h2>
        <div className="mt-4 grid gap-3">
          {accounts.map(([name, email, enKey, arKey]) => (
            <form key={email} action={loginFromForm} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value="demo-pass" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted">{email}</p>
                <p className="text-sm">{locale === "ar" ? notes.ar[arKey] : notes.en[enKey]}</p>
              </div>
              <SubmitButton tone="ghost" pendingLabel={t.signingIn}>
                {t.continue}
              </SubmitButton>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
