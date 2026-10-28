"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";

export default function PartnerError({ reset }: { error: Error; reset: () => void }) {
  const t = copy(useLocale());
  return (
    <div className="card p-6" role="alert">
      <h1 className="serif text-2xl">{t.partnerError}</h1>
      <p className="mt-2 text-muted">{t.tryIdAgain}</p>
      <button className="btn btn-primary mt-4" type="button" onClick={() => reset()}>
        {t.tryAgain}
      </button>
    </div>
  );
}
