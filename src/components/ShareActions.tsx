"use client";

import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
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
      {copied ? "Link copied" : "Copy verification link"}
    </button>
  );
}

export function PrintButton() {
  return (
    <button className="btn btn-ghost no-print" type="button" onClick={() => window.print()}>
      Print or save PDF
    </button>
  );
}
