import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/hi";

import { normalizeLanguageCode } from "../i18n/languages";

const DAYJS_LOCALE = {
  en: "en",
  hi: "hi",
};

/**
 * Keep dayjs formatting (charts, list dates) aligned with the UI language.
 */
export function syncDayjsLocale(lng) {
  const canon = normalizeLanguageCode(lng);
  const key = DAYJS_LOCALE[canon] ?? "en";
  dayjs.locale(key);
}
