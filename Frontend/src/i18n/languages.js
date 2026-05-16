/** Lynkforge supports English and Hindi only. */
export const LANGUAGES = [
  { code: "en", short: "EN", label: "English" },
  { code: "hi", short: "HI", label: "हिंदी" },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

/** Browser / detector variants → canonical `LANGUAGE_CODES`. */
const VARIANT_TO_CANONICAL = {
  "en-us": "en",
  "en-gb": "en",
  "hi-in": "hi",
};

/** Map detector / browser tags to `en` or `hi`; anything else defaults to English. */
export function normalizeLanguageCode(lng) {
  if (!lng) return "en";
  const k = String(lng).toLowerCase().replace(/_/g, "-");
  if (VARIANT_TO_CANONICAL[k]) return VARIANT_TO_CANONICAL[k];
  const exact = LANGUAGES.find((l) => l.code.toLowerCase() === k);
  if (exact) return exact.code;
  const base = k.split("-")[0];
  const baseMatch = LANGUAGES.find((l) => l.code === base);
  if (baseMatch) return baseMatch.code;
  return "en";
}

export function applyDocumentLanguageAttributes(lng) {
  const canon = normalizeLanguageCode(lng);
  document.documentElement.lang = canon;
  document.documentElement.dir = "ltr";
}
