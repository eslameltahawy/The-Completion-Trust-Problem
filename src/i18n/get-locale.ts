import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "./locale";

export async function getLocale() {
  const jar = await cookies();
  return parseLocale(jar.get(LOCALE_COOKIE)?.value);
}
