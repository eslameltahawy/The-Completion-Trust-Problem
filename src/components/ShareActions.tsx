"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";
import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
  const t = copy(useLocale());
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="btn btn-ghost no-print"
      type="button"
      onClick={async () => {
        const absolute = value.startsWith("http") ? value : `${window.location.origin}${value}`;
        await navigator.clipboard.writeText(absolute);
        setCopied(true);
      }}
    >
      {copied ? t.copied : t.copyLink}
    </button>
  );
}

export function PrintButton() {
  const t = copy(useLocale());
  return (
    <button className="btn btn-ghost no-print" type="button" onClick={() => window.print()}>
      {t.print}
    </button>
  );
}
