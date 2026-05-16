import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../locales/en/translation.json";
import hi from "../locales/hi/translation.json";
import {
  applyDocumentLanguageAttributes,
  LANGUAGE_CODES,
  normalizeLanguageCode,
} from "./languages";
import { syncDayjsLocale } from "../utils/syncDayjsLocale";

function onLanguageChanged(lng) {
  applyDocumentLanguageAttributes(lng);
  syncDayjsLocale(lng);
}

i18next.on("languageChanged", onLanguageChanged);

const bundles = { en, hi };

const resources = {};
for (const code of LANGUAGE_CODES) {
  resources[code] = { translation: bundles[code] };
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: LANGUAGE_CODES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "lynkforge_i18nextLng",
    },
  })
  .then(() => {
    const normalized = normalizeLanguageCode(i18next.language);
    void i18next.changeLanguage(normalized);
    applyDocumentLanguageAttributes(normalized);
    syncDayjsLocale(normalized);
  })
  .catch(() => {});

export default i18next;
