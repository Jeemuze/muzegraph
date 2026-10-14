export const DEFAULT_LOCALE = "id";

export const SUPPORTED_LOCALES = ["id", "en"];

export function isSupportedLocale(locale: string) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function getFallbackLocale(locale?: string) {
  if (!locale) return DEFAULT_LOCALE;

  return isSupportedLocale(locale)
    ? locale
    : DEFAULT_LOCALE;
}
