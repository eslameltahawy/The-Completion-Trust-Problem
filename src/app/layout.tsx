import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { getLocale } from "@/i18n/get-locale";
import { copy } from "@/i18n/messages";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: {
    default: "Career 180 Completion Trust",
    template: "%s · Career 180",
  },
  description: "A prototype that separates course completion from demonstrated competency.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const t = copy(locale);
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={`${sans.variable} ${serif.variable} ${arabic.variable} antialiased`}>
        <a className="skip" href="#main">
          {t.skip}
        </a>
        <Suspense>
          <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
