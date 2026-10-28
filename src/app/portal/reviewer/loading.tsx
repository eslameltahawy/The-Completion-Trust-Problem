import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";

export default async function Loading() {
  const t = copy(await getLocale());
  return (
    <p role="status" className="text-muted">
      {t.loadingReviewer}
    </p>
  );
}
